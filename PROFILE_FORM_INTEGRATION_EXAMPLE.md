// Example: How to update your profile-form.tsx with address autocomplete

import { AddressGroupField } from "@/components/form-fields/address-group-field";
import { AddressAutocompleteField } from "@/components/form-fields/address-autocomplete-field";

// Add these to your form schema in profile-form.tsx:
// ============================================================

const formSchema = z.object({
    // ... existing fields
    name: z.string().min(2),
    phone: z.string().optional().or(z.literal('')),
    education: z.string().optional(),
    passingYear: z.coerce.number().optional(),
    improvementAreas: z.array(z.string()).optional(),
    careerPlan: z.string().optional(),
    
    // NEW: Address fields
    address: z.string().min(5, { message: "Please enter a valid address." }).optional().or(z.literal('')),
    apartment: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    postalCode: z.string().optional().or(z.literal('')),
    country: z.string().optional().or(z.literal('')),
});

// ============================================================
// In your form JSX, add this where you want the address section:
// ============================================================

<section className="py-4">
  <h3 className="text-lg font-semibold mb-4">Address Information</h3>
  
  {/* Option 1: Use the group component (recommended) */}
  <AddressGroupField
    control={form.control}
    addressField="address"
    apartmentField="apartment"
    cityField="city"
    stateField="state"
    postalCodeField="postalCode"
    countryField="country"
    disabled={isSubmitting}
  />

  {/* OR Option 2: Use individual fields for more flexibility */}
  <div className="space-y-4">
    <FormField
      control={form.control}
      name="address"
      render={({ field }) => (
        <AddressAutocompleteField
          field={field}
          label="Street Address"
          placeholder="123 Main Street"
          disabled={isSubmitting}
          onAddressSelected={(components) => {
            // Auto-fill the other fields
            form.setValue('city', components.city || components.locality || '');
            form.setValue('state', components.state || components.administrative_area_level_1 || '');
            form.setValue('postalCode', components.postal_code || '');
            form.setValue('country', components.country || '');
          }}
        />
      )}
    />
  </div>
</section>

// ============================================================
// Update your onSubmit handler to include address fields:
// ============================================================

async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in." });
        return;
    }

    // Your existing validation...

    try {
        // Update user profile with address data
        const { error } = await supabase
            .from('student_profiles')
            .update({
                name: values.name,
                phone: values.phone || null,
                education: values.education,
                passingYear: values.passingYear,
                improvementAreas: values.improvementAreas,
                careerPlan: values.careerPlan,
                needsInterviewSupport: values.needsInterviewSupport === 'yes',
                
                // NEW: Address fields
                address: values.address || null,
                apartment: values.apartment || null,
                city: values.city || null,
                state: values.state || null,
                postalCode: values.postalCode || null,
                country: values.country || null,
                updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id);

        if (error) throw error;

        toast({
            title: "Success",
            description: "Profile updated successfully!",
        });

        if (onSave) onSave();
        if (isMandatory) router.push('/student');
    } catch (error) {
        console.error('Error updating profile:', error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update profile. Please try again.",
        });
    }
}

// ============================================================
// Don't forget to update useEffect to load address data:
// ============================================================

useEffect(() => {
    if (userData) {
        form.reset({
            name: userData.name || "",
            phone: userData.phone || "",
            education: userData.education || "",
            passingYear: userData.passingYear || new Date().getFullYear(),
            improvementAreas: userData.improvementAreas || [],
            careerPlan: userData.careerPlan || "",
            needsInterviewSupport: userData.needsInterviewSupport ? 'yes' : 'no',
            
            // NEW: Load address fields
            address: userData.address || "",
            apartment: userData.apartment || "",
            city: userData.city || "",
            state: userData.state || "",
            postalCode: userData.postalCode || "",
            country: userData.country || "",
        });
    }
}, [userData, form]);
