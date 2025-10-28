
import {NextRequest, NextResponse} from "next/server";
import { createClient } from '@supabase/supabase-js';
import { sendResumeAdminNotification, sendResumeConfirmation, type ResumeSubmissionData } from '@/lib/resume-email-service';

// Create a Supabase client with service role key for file uploads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    if (!file) {
        return NextResponse.json({error: "No file provided"}, {status: 400});
    }

    if (!name || !email) {
        return NextResponse.json({error: "Name and email are required"}, {status: 400});
    }

    // Validate file type and size
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({error: "Invalid file type. Please upload PDF, DOC, or DOCX files only."}, {status: 400});
    }

    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return NextResponse.json({error: "File size too large. Maximum size is 10MB."}, {status: 400});
    }

    try {
        // Create unique filename with timestamp and original name
        const timestamp = Date.now();
        const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '-');
        const fileName = `resume-${timestamp}-${sanitizedName}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to Supabase Storage (dedicated resumes bucket)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('resumes')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error("Supabase upload error:", uploadError);
            return NextResponse.json({error: `Failed to upload file: ${uploadError.message}`}, {status: 500});
        }

        // Get public URL
        const { data: publicUrlData } = supabaseAdmin.storage
            .from('resumes')
            .getPublicUrl(fileName);

        // Save submission details to database
        const { data: submissionData, error: dbError } = await supabaseAdmin
            .from('resume_submissions')
            .insert({
                name: name.trim(),
                email: email.trim().toLowerCase(),
                file_name: fileName,
                file_url: publicUrlData.publicUrl,
                file_size: file.size,
                file_type: file.type,
                status: 'pending'
            })
            .select('id')
            .single();

        if (dbError) {
            console.error("Database insertion error:", dbError);
            // Try to clean up uploaded file if database insertion fails
            await supabaseAdmin.storage.from('resumes').remove([fileName]);
            return NextResponse.json({error: "Failed to save submission details"}, {status: 500});
        }

        console.log(`✅ Resume submission saved: ${submissionData.id}`);
        console.log(`📄 File: ${fileName}`);
        console.log(`👤 User: ${name} (${email})`);

        // Send email notifications (don't block the response if emails fail)
        const emailData: ResumeSubmissionData = {
            id: submissionData.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            fileName: fileName,
            fileUrl: publicUrlData.publicUrl,
            fileSize: file.size,
            fileType: file.type,
            submittedAt: new Date().toISOString()
        };

        // Send notifications asynchronously (don't await to avoid blocking the response)
        Promise.all([
            sendResumeAdminNotification(emailData),
            sendResumeConfirmation(emailData)
        ]).then(([adminSent, confirmationSent]) => {
            console.log(`📧 Resume submission ${submissionData.id} notifications:`, { 
                adminNotification: adminSent ? '✅ sent' : '❌ failed (check SMTP config)',
                userConfirmation: confirmationSent ? '✅ sent' : '❌ failed (check SMTP config)'
            });
            
            if (!adminSent || !confirmationSent) {
                console.log('💡 To enable email notifications, ensure SMTP configuration is complete in .env.local');
            }
        }).catch((error) => {
            console.error('❌ Error sending resume email notifications:', error);
        });

        return NextResponse.json({
            success: true,
            submissionId: submissionData.id,
            message: "Resume uploaded successfully! You'll receive a confirmation email shortly. Our team will review it and get back to you within 24-48 hours."
        });

    } catch (error) {
        console.error("File upload error:", error);
        return NextResponse.json({error: "Failed to upload file"}, {status: 500});
    }
}
