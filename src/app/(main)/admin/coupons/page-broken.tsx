
'use client';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
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

const formSchema = z.object({
  code: z.string().min(4, 'Code must be at least 4 characters.').max(20).toUpperCase(),
  type: z.enum(['percentage', 'fixed'], { required_error: 'Type is required.' }),
  value: z.coerce.number().positive('Value must be a positive number.'),
  expiresAt: z.date().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
});

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: '', type: 'percentage', value: 10 },
  });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    const q = query(collection(db, 'coupons'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Coupon)));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching coupons:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load coupons.' });
        setLoading(false);
    });
    return () => unsubscribe();
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

  return (
    <div>
      <PageHeader title="Coupon Management" description="Create and manage discount coupons for your courses." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>New Coupon</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
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
                      <FormItem><FormLabel>Usage Limit (Optional)</FormLabel><FormControl><Input type="number" {...field} placeholder="e.g., 100" /></FormControl><FormMessage /></FormItem>
                    )} />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Coupon
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">Existing Coupons</h3>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
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
                        {loading ? <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow> 
                        : coupons.length > 0 ? coupons.map(coupon => (
                            <TableRow key={coupon.id}>
                                <TableCell className="font-mono font-semibold">{coupon.code}</TableCell>
                                <TableCell className="capitalize">{coupon.type}</TableCell>
                                <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `$${coupon.value}`}</TableCell>
                                <TableCell>{coupon.usageCount} / {coupon.usageLimit || '∞'}</TableCell>
                                <TableCell>{coupon.expiresAt ? format(coupon.expiresAt.toDate(), 'dd MMM yyyy') : 'Never'}</TableCell>
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
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No coupons have been created yet.
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
