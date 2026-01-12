
import { RulePack, Rule, Quiz } from './types';

const generateId = () => Math.random().toString(36).substr(2, 9);

export const STARTER_RULE_PACKS: RulePack[] = [
  {
    id: 'bb-drink',
    name: 'Standard Tip-Off',
    sport: 'Basketball',
    mode: 'Drinking',
    rules: [
      { id: generateId(), label: 'Selected team scores', action: 'Take', value: 1, unit: 'sip', target: 'Everyone', enabled: true, countdown: 5 },
      { id: generateId(), label: '3-Pointer made', action: 'Take', value: 2, unit: 'sips', target: 'Random', enabled: true, countdown: 8 },
      { id: generateId(), label: 'Slam Dunk!', action: 'Take', value: 3, unit: 'sips', target: 'Everyone', enabled: true, countdown: 5 },
      { id: generateId(), label: 'Timeout: Reaction Test', action: 'Reaction!', value: 2, unit: 'sips', target: 'Last to React', enabled: true, countdown: 10 },
      { id: generateId(), label: 'Airball', action: 'Pick someone to drink', value: 1, unit: 'sip', target: 'Specific', enabled: true, countdown: 5 },
    ]
  },
  {
    id: 'sc-drink',
    name: 'Pub Pitch',
    sport: 'Soccer',
    mode: 'Drinking',
    rules: [
      { id: generateId(), label: 'GOAL!', action: 'Everyone drinks', value: 3, unit: 'sips', target: 'Everyone', enabled: true, countdown: 10 },
      { id: generateId(), label: 'Yellow Card', action: 'Take', value: 2, unit: 'sips', target: 'Random', enabled: true, countdown: 5 },
      { id: generateId(), label: 'VAR Check', action: 'Freeze! Last to move drinks', value: 1, unit: 'sip', target: 'Last to React', enabled: true, countdown: 12 },
    ]
  }
];

export const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    question: "Who won the most NBA titles?",
    options: ["Lakers", "Celtics", "Warriors", "Bulls"],
    correctIndex: 1,
    penalty: "Take 2 sips if wrong!"
  },
  {
    id: 'q2',
    question: "What is the length of a soccer match?",
    options: ["60 min", "80 min", "90 min", "100 min"],
    correctIndex: 2,
    penalty: "Take 1 sip if wrong!"
  },
  {
    id: 'q3',
    question: "Which country has won the most World Cups?",
    options: ["Germany", "Italy", "Brazil", "Argentina"],
    correctIndex: 2,
    penalty: "Waterfall for 5 seconds if wrong!"
  }
];
