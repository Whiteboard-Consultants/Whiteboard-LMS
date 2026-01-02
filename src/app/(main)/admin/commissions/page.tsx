'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  getAllCommissionRates,
  deleteCommissionRate,
  CommissionRate,
} from './commission-actions';
import { CommissionFormDialog } from './commission-form-dialog';

export default function CommissionManagementPage() {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CommissionRate | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);

    const result = await getAllCommissionRates();

    if (!result.success) {
      setError(result.error || 'Failed to fetch commission rates');
    } else {
      setRates(result.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const handleDelete = async (rateId: string) => {
    if (!confirm('Are you sure you want to delete this commission rate?')) {
      return;
    }

    const result = await deleteCommissionRate(rateId);

    if (result.success) {
      setRates(rates.filter(r => r.id !== rateId));
    } else {
      setError(result.error || 'Failed to delete commission rate');
    }
  };

  const handleEditClick = (rate: CommissionRate) => {
    setEditingRate(rate);
    setIsDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingRate(null);
    setIsDialogOpen(true);
  };

  const handleRateSaved = async () => {
    setIsDialogOpen(false);
    setEditingRate(null);
    await fetchRates();
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      platform: 'default',
      instructor: 'secondary',
      course: 'outline',
    };
    return <Badge variant={variants[level] || 'default'}>{level}</Badge>;
  };

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <PageHeader
          title="Commission Management"
          description="Loading commission rates..."
        />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <PageHeader
          title="Commission Management"
          description="Configure instructor commission rates for the platform"
        />
        <Button onClick={handleCreateClick} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Rate
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Commission Rates</CardTitle>
        </CardHeader>
        <CardContent>
          {rates.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No commission rates configured yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Commission %</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rates.map(rate => (
                  <TableRow key={rate.id}>
                    <TableCell>{getLevelBadge(rate.level)}</TableCell>
                    <TableCell className="font-semibold">
                      {rate.commission_percentage}%
                    </TableCell>
                    <TableCell>
                      {rate.level === 'platform' && 'Platform Default'}
                      {rate.level === 'instructor' && 'Instructor-specific'}
                      {rate.level === 'course' && 'Course-specific'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {rate.description || '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(rate.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {rate.level !== 'platform' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(rate)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rate.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {rate.level === 'platform' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(rate)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CommissionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingRate={editingRate}
        onRateSaved={handleRateSaved}
      />
    </div>
  );
}
