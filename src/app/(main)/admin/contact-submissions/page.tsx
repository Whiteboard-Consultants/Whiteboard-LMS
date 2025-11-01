'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Eye,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { getContactSubmissions, deleteContactSubmission } from '@/app/(main)/admin/contact-submissions/actions';

interface ContactSubmission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  inquiry_type: string;
  message?: string;
  submitted_at: string;
  created_at: string;
}

export default function ContactSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [activeTab, setActiveTab] = useState<string>('list');

  // Filter submissions based on search and inquiry type
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = 
      submission.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.phone.includes(searchTerm);
    
    const matchesInquiry = selectedInquiry === 'all' || submission.inquiry_type === selectedInquiry;
    
    return matchesSearch && matchesInquiry;
  });

  // Get unique inquiry types
  const inquiryTypes = Array.from(new Set(submissions.map(s => s.inquiry_type)));

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const result = await getContactSubmissions();
      if (result.success && result.data) {
        setSubmissions(result.data);
      } else {
        console.error('Failed to fetch contact submissions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching contact submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this submission?')) {
      try {
        const result = await deleteContactSubmission(id);
        if (result.success) {
          setSubmissions(submissions.filter(s => s.id !== id));
          if (selectedSubmission?.id === id) {
            setSelectedSubmission(null);
          }
        } else {
          alert('Failed to delete submission: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Failed to delete submission');
      }
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Inquiry Type', 'Message', 'Submitted At'];
    const csvData = filteredSubmissions.map(submission => [
      `${submission.first_name} ${submission.last_name}`,
      submission.email,
      submission.phone,
      submission.inquiry_type,
      submission.message || '',
      format(new Date(submission.submitted_at), 'yyyy-MM-dd HH:mm:ss')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-submissions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setActiveTab('detail');
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const getInquiryBadgeVariant = (type: string) => {
    const variants: Record<string, any> = {
      'Study Abroad': 'default',
      'UOW Admissions': 'secondary',
      'College Admissions': 'outline',
      'Test Preparation': 'destructive',
      'Career Development': 'default',
      'General Enquiry': 'secondary',
    };
    return variants[type] || 'outline';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Submissions</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer inquiries ({submissions.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedInquiry} onValueChange={setSelectedInquiry}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by inquiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Inquiries</SelectItem>
                {inquiryTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="detail">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>Contact Submissions ({filteredSubmissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Inquiry Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {submission.first_name} {submission.last_name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                              {submission.email}
                            </a>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${submission.phone}`} className="hover:underline">
                              {submission.phone}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getInquiryBadgeVariant(submission.inquiry_type)}>
                          {submission.inquiry_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(submission.submitted_at), 'dd MMM yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(submission.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSubmissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Submission</CardTitle>
                <CardDescription>Choose a submission to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredSubmissions.map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      selectedSubmission?.id === submission.id
                        ? 'bg-primary/10 border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <p className="font-medium text-sm">
                      {submission.first_name} {submission.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {submission.inquiry_type} • {format(new Date(submission.submitted_at), 'dd MMM')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedSubmission ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Contact Information</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                            <p className="font-medium">{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                            <a 
                              href={`mailto:${selectedSubmission.email}`} 
                              className="text-blue-600 hover:underline break-all text-sm"
                              title={selectedSubmission.email}
                            >
                              {selectedSubmission.email}
                            </a>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                            <a 
                              href={`tel:${selectedSubmission.phone}`} 
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {selectedSubmission.phone}
                            </a>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Inquiry Details</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Type</p>
                            <Badge variant={getInquiryBadgeVariant(selectedSubmission.inquiry_type)}>
                              {selectedSubmission.inquiry_type}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Submitted</p>
                            <p className="font-medium text-sm">{format(new Date(selectedSubmission.submitted_at), 'dd MMMM yyyy HH:mm')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedSubmission.message && (
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </h3>
                        <div className="bg-muted/50 p-4 rounded-lg border">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedSubmission.message}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                      <Button 
                        onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.inquiry_type} Inquiry`, '_blank')}
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Reply via Email
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open(`tel:${selectedSubmission.phone}`, '_blank')}
                        className="sm:w-auto"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleDelete(selectedSubmission.id)}
                        className="sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a submission from the list to view details.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}