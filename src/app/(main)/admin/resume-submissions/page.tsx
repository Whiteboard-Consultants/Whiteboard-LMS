'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Download, 
  Eye, 
  RefreshCw,
  FileText,
  Calendar,
  User,
  Mail,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { getResumeSubmissions, updateResumeStatus } from './actions';

interface ResumeSubmission {
  id: string;
  name: string;
  email: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  submitted_at: string;
  status: string;
  notes?: string;
}

export default function ResumeSubmissionsPage() {
  const [submissions, setSubmissions] = useState<ResumeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Filter submissions based on status
  const filteredSubmissions = submissions.filter((submission) => {
    return selectedStatus === 'all' || submission.status === selectedStatus;
  });

  // Get unique statuses
  const statuses = Array.from(new Set(submissions.map(s => s.status)));

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const result = await getResumeSubmissions();
      if (result.success && result.data) {
        setSubmissions(result.data);
      } else {
        console.error('Failed to fetch resume submissions:', result.error);
      }
    } catch (error) {
      console.error('Error fetching resume submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const result = await updateResumeStatus(id, newStatus);
      if (result.success) {
        setSubmissions(submissions.map(s => 
          s.id === id ? { ...s, status: newStatus } : s
        ));
      } else {
        alert('Failed to update status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, any> = {
      'pending': 'default',
      'reviewing': 'secondary',
      'completed': 'default',
      'contacted': 'outline',
    };
    return variants[status] || 'outline';
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Resume Submissions</h1>
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
          <h1 className="text-3xl font-bold">Resume Submissions</h1>
          <p className="text-muted-foreground">
            Manage and review resume evaluation requests ({submissions.length} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSubmissions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resume Submissions ({filteredSubmissions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>File Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{submission.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <a 
                        href={`mailto:${submission.email}`} 
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {submission.email}
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-3 w-3" />
                        <span className="truncate max-w-32" title={submission.file_name}>
                          {submission.file_name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(submission.file_size)} • {submission.file_type.split('/')[1]?.toUpperCase()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={submission.status}
                      onValueChange={(value) => handleStatusUpdate(submission.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <Badge variant={getStatusBadgeVariant(submission.status)}>
                          {submission.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewing">Reviewing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(submission.submitted_at), 'MMM dd, yyyy HH:mm')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(submission.file_url, '_blank')}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadFile(submission.file_url, submission.file_name)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredSubmissions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No resume submissions found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}