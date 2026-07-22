'use client';

import React, { useEffect, useState } from 'react';
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
  Download,
  Eye,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getRiasecAssessments,
  deleteRiasecAssessment,
} from '@/app/(main)/admin/riasec/actions';

interface RiasecAssessment {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  realistic_score: number | null;
  investigative_score: number | null;
  artistic_score: number | null;
  social_score: number | null;
  enterprising_score: number | null;
  conventional_score: number | null;
  primary_profile: string | null;
  secondary_profile: string | null;
  tertiary_profile: string | null;
  email_sent_to_student: boolean | null;
  email_sent_to_admin: boolean | null;
  created_at: string;
  completed_at: string | null;
}

const profileLabels: Record<string, string> = {
  realistic: 'Realistic',
  investigative: 'Investigative',
  artistic: 'Artistic',
  social: 'Social',
  enterprising: 'Enterprising',
  conventional: 'Conventional',
};

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export default function RiasecLeadsPage() {
  const [assessments, setAssessments] = useState<RiasecAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAssessment, setSelectedAssessment] = useState<RiasecAssessment | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  const filteredAssessments = assessments.filter((assessment) => {
    const name = assessment.full_name || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (assessment.primary_profile || '').toLowerCase().includes(searchTerm.toLowerCase());

    const isCompleted = !!assessment.completed_at;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && isCompleted) ||
      (statusFilter === 'registered' && !isCompleted);

    return matchesSearch && matchesStatus;
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const result = await getRiasecAssessments();
      if (result.success && result.data) {
        setAssessments(result.data);
      } else {
        console.error('Failed to fetch RIASEC assessments:', result.error);
      }
    } catch (error) {
      console.error('Error fetching RIASEC assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this RIASEC lead?')) return;

    try {
      const result = await deleteRiasecAssessment(id);
      if (result.success) {
        setAssessments((prev) => prev.filter((a) => a.id !== id));
        if (selectedAssessment?.id === id) {
          setSelectedAssessment(null);
        }
      } else {
        alert('Failed to delete lead: ' + result.error);
      }
    } catch (error) {
      console.error('Error deleting RIASEC assessment:', error);
      alert('Failed to delete lead');
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Status',
      'Primary Profile',
      'Secondary Profile',
      'Tertiary Profile',
      'Realistic',
      'Investigative',
      'Artistic',
      'Social',
      'Enterprising',
      'Conventional',
      'Registered At',
      'Completed At',
    ];

    const rows = filteredAssessments.map((assessment) => [
      assessment.full_name || '',
      assessment.email,
      assessment.completed_at ? 'Completed' : 'Registered',
      assessment.primary_profile || '',
      assessment.secondary_profile || '',
      assessment.tertiary_profile || '',
      String(assessment.realistic_score ?? 0),
      String(assessment.investigative_score ?? 0),
      String(assessment.artistic_score ?? 0),
      String(assessment.social_score ?? 0),
      String(assessment.enterprising_score ?? 0),
      String(assessment.conventional_score ?? 0),
      format(new Date(assessment.created_at), 'yyyy-MM-dd HH:mm:ss'),
      assessment.completed_at
        ? format(new Date(assessment.completed_at), 'yyyy-MM-dd HH:mm:ss')
        : '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => escapeCsv(field)).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `riasec-leads-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleViewAssessment = (assessment: RiasecAssessment) => {
    setSelectedAssessment(assessment);
    setActiveTab('detail');
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const completedCount = assessments.filter((a) => a.completed_at).length;
  const registeredOnlyCount = assessments.length - completedCount;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">RIASEC Leads</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RIASEC Leads</h1>
          <p className="text-muted-foreground">
            Career assessment registrations and results ({assessments.length} total ·{' '}
            {completedCount} completed · {registeredOnlyCount} registered only)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAssessments} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or profile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All leads</SelectItem>
                <SelectItem value="registered">Registered only</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
              <CardTitle>RIASEC Leads ({filteredAssessments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Primary Profile</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <p className="font-medium">{assessment.full_name || '—'}</p>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${assessment.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {assessment.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={assessment.completed_at ? 'default' : 'secondary'}>
                          {assessment.completed_at ? 'Completed' : 'Registered'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assessment.primary_profile ? (
                          <Badge variant="outline">
                            {profileLabels[assessment.primary_profile] ||
                              assessment.primary_profile}
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(assessment.created_at), 'dd MMM yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAssessment(assessment)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(assessment.id)}
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

              {filteredAssessments.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No RIASEC leads found matching your criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Select Lead</CardTitle>
                <CardDescription>Choose a lead to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredAssessments.map((assessment) => (
                  <div
                    key={assessment.id}
                    className={`p-3 rounded-lg cursor-pointer border transition-colors ${
                      selectedAssessment?.id === assessment.id
                        ? 'bg-primary/10 border-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedAssessment(assessment)}
                  >
                    <p className="font-medium text-sm">{assessment.full_name || assessment.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {assessment.completed_at ? 'Completed' : 'Registered'} ·{' '}
                      {format(new Date(assessment.created_at), 'dd MMM')}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAssessment ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Contact</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Name</p>
                            <p className="font-medium">{selectedAssessment.full_name || '—'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                            <a
                              href={`mailto:${selectedAssessment.email}`}
                              className="text-blue-600 hover:underline break-all text-sm"
                            >
                              {selectedAssessment.email}
                            </a>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                            <Badge
                              variant={selectedAssessment.completed_at ? 'default' : 'secondary'}
                            >
                              {selectedAssessment.completed_at ? 'Completed' : 'Registered'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-3">Timeline</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Registered
                            </p>
                            <p className="font-medium text-sm">
                              {format(
                                new Date(selectedAssessment.created_at),
                                'dd MMMM yyyy HH:mm'
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              Completed
                            </p>
                            <p className="font-medium text-sm">
                              {selectedAssessment.completed_at
                                ? format(
                                    new Date(selectedAssessment.completed_at),
                                    'dd MMMM yyyy HH:mm'
                                  )
                                : 'Not completed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedAssessment.completed_at && (
                      <div className="border-t pt-6 space-y-4">
                        <h3 className="font-semibold">Assessment Results</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedAssessment.primary_profile && (
                            <Badge>
                              1st:{' '}
                              {profileLabels[selectedAssessment.primary_profile] ||
                                selectedAssessment.primary_profile}
                            </Badge>
                          )}
                          {selectedAssessment.secondary_profile && (
                            <Badge variant="secondary">
                              2nd:{' '}
                              {profileLabels[selectedAssessment.secondary_profile] ||
                                selectedAssessment.secondary_profile}
                            </Badge>
                          )}
                          {selectedAssessment.tertiary_profile && (
                            <Badge variant="outline">
                              3rd:{' '}
                              {profileLabels[selectedAssessment.tertiary_profile] ||
                                selectedAssessment.tertiary_profile}
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {(
                            [
                              ['realistic', selectedAssessment.realistic_score],
                              ['investigative', selectedAssessment.investigative_score],
                              ['artistic', selectedAssessment.artistic_score],
                              ['social', selectedAssessment.social_score],
                              ['enterprising', selectedAssessment.enterprising_score],
                              ['conventional', selectedAssessment.conventional_score],
                            ] as const
                          ).map(([key, score]) => (
                            <div key={key} className="rounded-lg border p-3">
                              <p className="text-xs text-muted-foreground">
                                {profileLabels[key]}
                              </p>
                              <p className="text-lg font-semibold">{score ?? 0}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
                      <Button
                        onClick={() =>
                          window.open(
                            `mailto:${selectedAssessment.email}?subject=Your RIASEC Career Assessment`,
                            '_blank'
                          )
                        }
                        className="flex-1"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Lead
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(selectedAssessment.id)}
                        className="sm:w-auto"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Select a lead from the list to view details.
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
