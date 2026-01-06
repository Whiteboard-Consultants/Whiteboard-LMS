'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Loader2 } from 'lucide-react';

interface LearningGoalFormProps {
  skills: Array<{ id: string; name: string; category: string }>;
  onGoalCreated?: () => void;
}

export function LearningGoalForm({ skills, onGoalCreated }: LearningGoalFormProps) {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    goal_title: '',
    goal_description: '',
    role_title: '',
    target_skills: [] as string[],
    priority: '1',
    target_completion_date: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.goal_title.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Goal title is required' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/user/learning-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          priority: parseInt(formData.priority),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create learning goal');
      }

      toast({
        title: 'Success',
        description: 'Learning goal created successfully!',
      });

      setFormData({
        goal_title: '',
        goal_description: '',
        role_title: '',
        target_skills: [],
        priority: '1',
        target_completion_date: '',
      });

      setOpen(false);
      onGoalCreated?.();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create learning goal',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSkill = (skillId: string) => {
    setFormData(prev => ({
      ...prev,
      target_skills: prev.target_skills.includes(skillId)
        ? prev.target_skills.filter(id => id !== skillId)
        : [...prev.target_skills, skillId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Learning Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Learning Goal</DialogTitle>
          <DialogDescription>
            Set specific skill targets to track your professional development
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Goal Title *</label>
            <Input
              placeholder="e.g., Become a Senior Data Scientist"
              value={formData.goal_title}
              onChange={(e) => setFormData(prev => ({ ...prev, goal_title: e.target.value }))}
              disabled={loading}
            />
          </div>

          {/* Goal Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Describe what you want to achieve with this goal"
              value={formData.goal_description}
              onChange={(e) => setFormData(prev => ({ ...prev, goal_description: e.target.value }))}
              disabled={loading}
              rows={3}
            />
          </div>

          {/* Role Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role (Optional)</label>
            <Input
              placeholder="e.g., Senior Data Scientist, Product Manager"
              value={formData.role_title}
              onChange={(e) => setFormData(prev => ({ ...prev, role_title: e.target.value }))}
              disabled={loading}
            />
          </div>

          {/* Target Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Skills</label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
              {skills.length === 0 ? (
                <p className="col-span-2 text-sm text-gray-500">No skills available</p>
              ) : (
                skills.map(skill => (
                  <label key={skill.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.target_skills.includes(skill.id)}
                      onChange={() => toggleSkill(skill.id)}
                      disabled={loading}
                      className="rounded"
                    />
                    <span className="text-sm">{skill.name}</span>
                    <span className="text-xs text-gray-500">({skill.category})</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
              <SelectTrigger disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">High</SelectItem>
                <SelectItem value="2">Medium</SelectItem>
                <SelectItem value="3">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Completion Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Completion Date (Optional)</label>
            <Input
              type="date"
              value={formData.target_completion_date}
              onChange={(e) => setFormData(prev => ({ ...prev, target_completion_date: e.target.value }))}
              disabled={loading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Goal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
