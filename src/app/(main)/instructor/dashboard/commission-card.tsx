import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Percent, TrendingUp } from 'lucide-react';

export function InstructorCommissionCard({
  commissionPercentage,
  totalEnrollments,
  totalEarned,
}: {
  commissionPercentage: number;
  totalEnrollments: number;
  totalEarned: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Your Commission
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Commission Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Commission Rate</p>
            </div>
            <p className="text-2xl font-bold">{commissionPercentage}%</p>
            <p className="text-xs text-muted-foreground">Per enrollment</p>
          </div>

          {/* Total Enrollments */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Enrollments</p>
            </div>
            <p className="text-2xl font-bold">{totalEnrollments}</p>
            <p className="text-xs text-muted-foreground">Total students</p>
          </div>

          {/* Total Earned */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
            </div>
            <p className="text-2xl font-bold">₹{totalEarned.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Commission earned</p>
          </div>
        </div>

        <div className="border-t pt-3">
          <p className="text-xs text-muted-foreground">
            You earn {commissionPercentage}% of the original course price for each enrollment, 
            regardless of any discounts applied to courses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
