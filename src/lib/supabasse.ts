import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const db = {
  // Fetch all habits with their completions
  async fetchHabits() {
    const { data, error } = await supabase
      .from('habits')
      .select(`
        *,
        completions (
          date_key
        )
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching habits:', error);
      return [];
    }

    return data;
  },

  // Fetch user stats
  async fetchUserStats() {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      console.error('Error fetching user stats:', error);
      return { total_will: 0 };
    }

    return data;
  },

  // Add a new habit
  async addHabit(habit: {
    id: string;
    name: string;
    area: string;
    color: string;
  }) {
    const { error } = await supabase
      .from('habits')
      .insert([{
        ...habit,
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('Error adding habit:', error);
      return false;
    }
    return true;
  },

  // Delete a habit
  async deleteHabit(habitId: string) {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', habitId);

    if (error) {
      console.error('Error deleting habit:', error);
      return false;
    }
    return true;
  },

  // Update habit name or area
  async updateHabit(habitId: string, updates: { name?: string; area?: string; color?: string }) {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId);

    if (error) {
      console.error('Error updating habit:', error);
      return false;
    }
    return true;
  },

  // Toggle habit completion
  async toggleCompletion(habitId: string, dateKey: string, isCompleted: boolean) {
    if (isCompleted) {
      // Add completion
      const { error } = await supabase
        .from('completions')
        .insert([{
          habit_id: habitId,
          date_key: dateKey,
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error adding completion:', error);
        return false;
      }
    } else {
      // Remove completion
      const { error } = await supabase
        .from('completions')
        .delete()
        .match({ habit_id: habitId, date_key: dateKey });

      if (error) {
        console.error('Error removing completion:', error);
        return false;
      }
    }
    return true;
  },

  // Update will power
  async updateWillPower(totalWill: number) {
    const { error } = await supabase
      .from('user_stats')
      .update({
        total_will: totalWill,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (error) {
      console.error('Error updating will power:', error);
      return false;
    }
    return true;
  },

  // Get habit completions for a specific date range
  async getCompletionsForDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('completions')
      .select('habit_id, date_key')
      .gte('date_key', startDate)
      .lte('date_key', endDate);

    if (error) {
      console.error('Error fetching completions:', error);
      return [];
    }

    return data;
  }
};