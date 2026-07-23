'use client';

import { MANAGER_PERMISSION_CATALOG, type PermissionKey } from '@/lib/permissions';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ManagerPermissionsFieldsProps {
  mode: 'all' | 'custom';
  onModeChange: (mode: 'all' | 'custom') => void;
  selected: PermissionKey[];
  onSelectedChange: (selected: PermissionKey[]) => void;
}

export function ManagerPermissionsFields({
  mode,
  onModeChange,
  selected,
  onSelectedChange,
}: ManagerPermissionsFieldsProps) {
  const togglePermission = (key: PermissionKey, checked: boolean) => {
    if (checked) {
      onSelectedChange([...selected, key]);
    } else {
      onSelectedChange(selected.filter((k) => k !== key));
    }
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div>
        <p className="text-sm font-medium">Manager access</p>
        <p className="text-xs text-muted-foreground">
          All admin areas except Users / system settings, or a custom subset.
        </p>
      </div>

      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as 'all' | 'custom')}
        className="space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="all" id="perm-all" />
          <Label htmlFor="perm-all">ALL (full manager catalog)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="custom" id="perm-custom" />
          <Label htmlFor="perm-custom">Custom selection</Label>
        </div>
      </RadioGroup>

      {mode === 'custom' && (
        <div className="grid max-h-56 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
          {MANAGER_PERMISSION_CATALOG.map((item) => {
            const checked = selected.includes(item.key);
            return (
              <label
                key={item.key}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) =>
                    togglePermission(item.key, value === true)
                  }
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
