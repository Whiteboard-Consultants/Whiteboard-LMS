'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  fetchLandingRegistrations,
  type LandingLead,
  type LandingLeadSource,
} from './landing-actions';

export function LandingRegistrationsReport() {
  const [leads, setLeads] = useState<LandingLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<'all' | LandingLeadSource>('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchLandingRegistrations()
      .then((result) => setLeads(result.data || []))
      .catch((error) => console.error('Failed to load landing registrations:', error))
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    sourceFilter === 'all' ? leads : leads.filter((lead) => lead.source === sourceFilter);

  const handleExport = () => {
    setExporting(true);
    try {
      const header = ['Source', 'Name', 'Email', 'Phone', 'Submitted', 'Details'];
      const rows = filtered.map((lead) =>
        [
          `"${lead.sourceLabel}"`,
          `"${lead.name.replace(/"/g, '""')}"`,
          `"${lead.email}"`,
          `"${lead.phone}"`,
          `"${format(new Date(lead.submittedAt), 'yyyy-MM-dd HH:mm')}"`,
          `"${lead.summary.replace(/"/g, '""')}"`,
        ].join(',')
      );
      const csv = [header.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'landing-registrations.csv';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="bg-muted p-4 md:p-6 rounded-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold tracking-tight">Landing page registrations</h3>
          <p className="text-sm text-muted-foreground">
            Leads from Online MBA, Resume Mastery, Future of Jobs, and Global Career Camp.
          </p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-2">
          <Select
            value={sourceFilter}
            onValueChange={(value) => setSourceFilter(value as 'all' | LandingLeadSource)}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All landing pages</SelectItem>
              <SelectItem value="online-mba">Online MBA</SelectItem>
              <SelectItem value="resume-mastery">Resume Mastery</SelectItem>
              <SelectItem value="future-of-jobs">Future of Jobs</SelectItem>
              <SelectItem value="gcc">Global Career Camp</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleExport}
            disabled={filtered.length === 0 || exporting}
            className="w-full md:w-auto"
          >
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filtered.length > 0 ? (
              filtered.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        {lead.email || '—'}
                      </div>
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {lead.phone}
                        </div>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{lead.sourceLabel}</Badge>
                  </TableCell>
                  <TableCell>
                    {lead.submittedAt
                      ? format(new Date(lead.submittedAt), 'dd MMM yyyy HH:mm')
                      : '—'}
                  </TableCell>
                  <TableCell className="max-w-sm text-sm text-muted-foreground">
                    {lead.summary || '—'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No landing page registrations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
