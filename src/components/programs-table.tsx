'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { getPrograms, updateProgram, deleteProgram, createProgram } from '@/app/admin/programs-actions';
import { useToast } from '@/hooks/use-toast';
import type { Program } from '@/app/admin/programs-actions';

interface ProgramsTableProps {
  isAdmin: boolean;
  programs?: Program[];
  hideBatchTitle?: boolean;
}

export function ProgramsTable({ isAdmin, programs: initialPrograms, hideBatchTitle }: ProgramsTableProps) {
  const [programs, setPrograms] = useState<Program[]>(initialPrograms || []);
  const [loading, setLoading] = useState(!initialPrograms);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Program>>({});
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProgram, setNewProgram] = useState<Partial<Program>>({
    name: '',
    description: '',
    start_date: '',
    last_enrollment_date: '',
    batch_time: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    // Only fetch if programs weren't passed in
    if (!initialPrograms) {
      fetchPrograms();
    }
  }, [initialPrograms]);

  const fetchPrograms = async () => {
    setLoading(true);
    const result = await getPrograms();
    if (result.success) {
      setPrograms(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load programs'
      });
    }
    setLoading(false);
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setEditingData({
      name: program.name,
      description: program.description,
      start_date: program.start_date,
      last_enrollment_date: program.last_enrollment_date,
      batch_time: program.batch_time
    });
  };

  const handleSaveEdit = async (programId: string) => {
    const result = await updateProgram(programId, editingData);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Program updated successfully'
      });
      setEditingId(null);
      await fetchPrograms();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to update program'
      });
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Are you sure you want to delete this program?')) {
      return;
    }

    const result = await deleteProgram(programId);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Program deleted successfully'
      });
      await fetchPrograms();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete program'
      });
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Program name is required'
      });
      return;
    }

    const result = await createProgram(newProgram as any);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Program created successfully'
      });
      setShowNewDialog(false);
      setNewProgram({ name: '', description: '', start_date: '', last_enrollment_date: '', batch_time: '' });
      await fetchPrograms();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to create program'
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-48">Loading programs...</div>;
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-center mb-6">
        {isAdmin && (
          <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Plus className="h-4 w-4" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Program</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Course *</label>
                  <Select value={newProgram.name || ''} onValueChange={(value) => setNewProgram({ ...newProgram, name: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.name}>
                          {program.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    placeholder="Program description"
                    value={newProgram.description || ''}
                    onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <Input
                    type="date"
                    value={newProgram.start_date || ''}
                    onChange={(e) => setNewProgram({ ...newProgram, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Enrollment Date</label>
                  <Input
                    type="date"
                    value={newProgram.last_enrollment_date || ''}
                    onChange={(e) => setNewProgram({ ...newProgram, last_enrollment_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Batch Time</label>
                  <Input
                    placeholder="e.g., 9:00 AM - 11:00 AM"
                    value={newProgram.batch_time || ''}
                    onChange={(e) => setNewProgram({ ...newProgram, batch_time: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateProgram} className="w-full">Create Program</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Admin Input Details Section */}
      {isAdmin && programs.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900 dark:text-blue-100">Admin Input Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {programs.map((program) => (
              <div key={`admin-detail-${program.id}`} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Program Name</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{program.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Start Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(program.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Last Date of Implementation</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formatDate(program.last_enrollment_date)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Batch Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{program.batch_time || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hideBatchTitle && (
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-center font-headline leading-tight">Batch Start Schedule</h2>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary dark:bg-black hover:bg-primary dark:hover:bg-black">
              <TableHead className="text-primary-foreground font-bold">Program Name</TableHead>
              <TableHead className="text-primary-foreground font-bold">Start Date</TableHead>
              <TableHead className="text-primary-foreground font-bold">Batch Time</TableHead>
              <TableHead className="text-primary-foreground font-bold">Last Date to Enrol</TableHead>
              {isAdmin && <TableHead className="text-right text-primary-foreground font-bold">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 5 : 4} className="text-center py-8 text-muted-foreground">
                  No programs available
                </TableCell>
              </TableRow>
            ) : (
              programs.map((program) => (
                <TableRow key={program.id} className="hover:bg-slate-100 dark:hover:bg-slate-900/30">
                  <TableCell className="font-semibold">
                    {editingId === program.id ? (
                      <Input
                        value={editingData.name || ''}
                        onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <div>
                        <p className="font-bold">{program.name}</p>
                        {program.description && (
                          <p className="text-sm text-muted-foreground">{program.description}</p>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {editingId === program.id ? (
                      <Input
                        type="date"
                        value={editingData.start_date || ''}
                        onChange={(e) => setEditingData({ ...editingData, start_date: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      formatDate(program.start_date)
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {editingId === program.id ? (
                      <Input
                        placeholder="e.g., 9:00 AM - 11:00 AM"
                        value={editingData.batch_time || ''}
                        onChange={(e) => setEditingData({ ...editingData, batch_time: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="text-sm">{program.batch_time || '-'}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {editingId === program.id ? (
                      <Input
                        type="date"
                        value={editingData.last_enrollment_date || ''}
                        onChange={(e) => setEditingData({ ...editingData, last_enrollment_date: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      formatDate(program.last_enrollment_date)
                    )}
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      {editingId === program.id ? (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleSaveEdit(program.id)}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(program)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteProgram(program.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
