import type { SlideDef } from '../types';
import { PART1_SLIDES } from './part1';
import { PART2_SLIDES } from './part2';
import { PART3_SLIDES } from './part3';
import { PART4_SLIDES } from './part4';
import { PART5_SLIDES } from './part5';

export const ALL_SLIDES: SlideDef[] = [
  ...PART1_SLIDES,
  ...PART2_SLIDES,
  ...PART3_SLIDES,
  ...PART4_SLIDES,
  ...PART5_SLIDES,
];

if (ALL_SLIDES.length !== 30) {
  throw new Error(`Expected exactly 30 slides, got ${ALL_SLIDES.length}`);
}

export const CHAPTER_STARTS = [3, 6, 13, 18, 23] as const;
