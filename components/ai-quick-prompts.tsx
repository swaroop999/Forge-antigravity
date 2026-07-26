import { ScrollView, Pressable, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface QuickPromptsProps {
  context?: 'dashboard' | 'training' | 'nutrition' | 'appearance' | 'discipline' | 'default';
  onSelectPrompt: (prompt: string) => void;
}

const PROMPTS_BY_CONTEXT = {
  dashboard: [
    'How am I doing overall?',
    'What should I focus on today?',
    'Am I on track for my 90-day goals?',
    'Analyze my last week',
  ],
  training: [
    "I can't do a pull-up yet, help me progress",
    'My [muscle] hurts during [exercise], what to do?',
    'Should I train today if I slept only 5 hours?',
    'Am I progressing fast enough?',
    'How to increase my push-up count?',
  ],
  nutrition: [
    'What can I substitute for [meal]?',
    'Am I hitting my protein target?',
    'Suggest a high-calorie snack',
    "I'm bloated, what should I do?",
    'How to increase appetite?',
  ],
  appearance: [
    'My skin is peeling from Adapalene, is this normal?',
    'I have a new pimple, what should I do?',
    'Can I use Niacinamide and Adapalene same night?',
    'How long until I see results?',
    "What if my skin gets worse?",
    "I'm shedding more hair after Minoxidil, is this normal?",
    'Best diet for hair growth?',
  ],
  discipline: [
    'I want to relapse to porn, help me now',
    'How do I stop procrastinating?',
    'I broke my streak, how do I bounce back?',
    'How to build discipline when unmotivated?',
    'Why am I feeling so lazy today?',
  ],
  default: [
    'How am I doing overall?',
    'What should I focus on today?',
    'Am I on track?',
    'Analyze my week',
  ],
};

export function AIQuickPrompts({ context = 'default', onSelectPrompt }: QuickPromptsProps) {
  const colors = useColors();
  const prompts = PROMPTS_BY_CONTEXT[context];

  return (
    <View className="px-4 py-3 border-t border-border">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
        {prompts.map((prompt, i) => (
          <Pressable
            key={i}
            onPress={() => onSelectPrompt(prompt)}
            className="bg-surface border border-border px-3 py-2 rounded-full"
          >
            <Text className="text-xs text-foreground">{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
