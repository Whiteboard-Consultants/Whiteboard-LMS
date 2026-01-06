'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createCoupon, deleteCoupon, updateCouponStatus, bulkDeleteCoupons } from './actions';

const formSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters.').max(20).toUpperCase(),
  type: z.enum(['percentage', 'fixed'], { required_error: 'Type is required.' }),
  value: z.coerce.number().positive('Value must be a positive number.'),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
});

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupons, setSelectedCoupons] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      code: '', 
      type: 'percentage', 
      value: 10,
      expiresAt: undefined,
      usageLimit: undefined
    },
  });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }

    // Initial fetch
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error("Error fetching coupons:", error);
          // Handle the case where coupons table doesn't exist yet
          if (error.code === 'PGRST205' || error.message?.includes('coupons')) {
            console.warn("Coupons table doesn't exist yet. Please create it in Supabase.");
            setCoupons([]); // Set empty array instead of showing error
          } else {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load coupons.' });
          }
        } else {
          // Map Supabase data to match our types
          const mappedData = (data || []).map(item => ({
            ...item,
            usageLimit: item.usage_limit,
            usageCount: item.usage_count,
            isActive: item.is_active,
            expiresAt: item.expires_at,
            createdAt: item.created_at
          })) as Coupon[];
          setCoupons(mappedData);
        }
      } catch (err) {
        console.error("Error fetching coupons:", err);
        // Handle the case where coupons table doesn't exist yet
        const error = err as any;
        if (error?.code === 'PGRST205' || error?.message?.includes('coupons')) {
          console.warn("Coupons table doesn't exist yet. Please create it in Supabase.");
          setCoupons([]); // Set empty array instead of showing error
        } else {
          toast({ variant: 'destructive', title: 'Error', description: 'Failed to load coupons.' });
        }
      }
      setLoading(false);
    };

    fetchCoupons();

    // Set up real-time subscription
    const channel = supabase
      .channel('coupons')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'coupons'
      }, () => {
        fetchCoupons();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const couponData = {
        ...values,
        expiresAt: values.expiresAt ? values.expiresAt.toISOString() : undefined,
    }
    const result = await createCoupon(couponData);
    if (result.success) {
      toast({ title: 'Success', description: 'Coupon has been created.' });
      form.reset({ code: '', type: 'percentage', value: 10, expiresAt: undefined, usageLimit: undefined});
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };
  
  const handleDelete = async (id: string) => {
    const result = await deleteCoupon(id);
    if (result.success) {
        toast({ title: "Coupon Deleted" });
    } else {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }

  const handleStatusChange = async (id: string, isActive: boolean) => {
    const result = await updateCouponStatus(id, isActive);
    if (!result.success) {
        toast({ variant: "destructive", title: "Error", description: result.error });
    }
  }
  const toggleCouponSelection = (id: string) => {
    const newSelected = new Set(selectedCoupons);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedCoupons(newSelected);
  }

  const toggleSelectAll = () => {
    if (selectedCoupons.size === coupons.length) {
      setSelectedCoupons(new Set());
    } else {
      setSelectedCoupons(new Set(coupons.map(c => c.id)));
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCoupons.size === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'No coupons selected.' });
      return;
    }

    setIsDeleting(true);
    const result = await bulkDeleteCoupons(Array.from(selectedCoupons));
    setIsDeleting(false);

    if (result.success) {
      toast({ title: 'Success', description: `${result.deletedCount} coupon(s) deleted.` });
      setSelectedCoupons(new Set());
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }
  return (
    <div>
      <PageHeader title="Coupon Management" description="Create and manage discount coupons for your courses." />
      <div className="space-y-8">
        {/* New Coupon Section */}
        <Card className="p-6">
          <CardTitle>New Coupon</CardTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <FormField name="code" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Coupon Code</FormLabel><FormControl><Input {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="type" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} name="type">
                      <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage /></FormItem>
                )} />
                <FormField name="value" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Discount Value</FormLabel><FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl><FormMessage /></FormItem>
                )} />
                <FormField name="expiresAt" control={form.control} render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Expiry Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "dd MMM yyyy") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                      </PopoverContent>
                    </Popover>
                  <FormMessage /></FormItem>
                )} />
                <FormField name="usageLimit" control={form.control} render={({ field }) => (
                  <FormItem><FormLabel>Usage Limit (Optional)</FormLabel><FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value ?? ''} 
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                      placeholder="e.g., 100" 
                    />
                  </FormControl><FormMessage /></FormItem>
                )} />
              <div className="flex justify-end">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Coupon
                </Button>
              </div>
            </form>
          </Form>
        </Card>

        {/* Existing Coupons Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Existing Coupons</h3>
            {selectedCoupons.size > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                    ) : (
                      <><Trash2 className="mr-2 h-4 w-4" /> Delete {selectedCoupons.size} Selected</>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {selectedCoupons.size} Coupon(s)?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the selected {selectedCoupons.size} coupon(s). This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                              <input
                                type="checkbox"
                                checked={coupons.length > 0 && selectedCoupons.size === coupons.length}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 cursor-pointer"
                                aria-label="Select all coupons"
                              />
                            </TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Usage</TableHead>
                            <TableHead>Expires</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? <TableRow><TableCell colSpan={8} className="h-24 text-center">Loading...</TableCell></TableRow> 
                        : coupons.length > 0 ? coupons.map(coupon => (
                            <TableRow key={coupon.id} className={selectedCoupons.has(coupon.id) ? 'bg-muted/50' : ''}>
                                <TableCell className="w-12">
                                  <input
                                    type="checkbox"
                                    checked={selectedCoupons.has(coupon.id)}
                                    onChange={() => toggleCouponSelection(coupon.id)}
                                    className="h-4 w-4 cursor-pointer"
                                    aria-label={`Select coupon ${coupon.code}`}
                                  />
                                </TableCell>
                                <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                                <TableCell className="capitalize">{coupon.type}</TableCell>
                                <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</TableCell>
                                <TableCell>{coupon.usageCount} / {coupon.usageLimit || '∞'}</TableCell>
                                <TableCell>{coupon.expiresAt ? format(new Date(coupon.expiresAt as string), 'dd MMM yyyy') : 'Never'}</TableCell>
                                <TableCell><Switch checked={coupon.isActive} onCheckedChange={(checked) => handleStatusChange(coupon.id, checked)} /></TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this coupon.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(coupon.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="text-center">
                                        <p className="text-muted-foreground">No coupons have been created yet.</p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            If you're seeing this and can't create coupons, please run the SQL script to create the coupons table in Supabase.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </div>
    </div>
  );
}