import type { SlideDef } from '../types';
import {
  chapter01Slide,
  chapter02Slide,
  chapter03Slide,
  chapter04Slide,
  chapter05Slide,
} from './chapterDividers';
import { PART1_SLIDES } from './part1';
import { PART2_SLIDES } from './part2';
import { PART3_SLIDES } from './part3';
import { PART4_SLIDES } from './part4';
import { PART5_SLIDES } from './part5';

export const ALL_SLIDES: SlideDef[] = [
  PART1_SLIDES[0], // 01: Bìa
  PART1_SLIDES[1], // 02: Mục lục
  chapter01Slide, // 03: Mở Phần 1
  ...PART1_SLIDES.slice(2), // 04..06: Nội dung Phần 1
  chapter02Slide, // 07: Mở Phần 2
  ...PART2_SLIDES, // 08..14: Nội dung Phần 2
  chapter03Slide, // 15: Mở Phần 3
  ...PART3_SLIDES, // 16..20: Nội dung Phần 3
  chapter04Slide, // 21: Mở Phần 4
  ...PART4_SLIDES, // 22..26: Nội dung Phần 4
  chapter05Slide, // 27: Mở Phần 5
  ...PART5_SLIDES, // 28..35: Nội dung Phần 5
];

// Enforce sequential 1-based numbering across all 35 slides
ALL_SLIDES.forEach((s, idx) => {
  s.number = idx + 1;
});

if (ALL_SLIDES.length !== 35) {
  throw new Error(`Expected exactly 35 slides, got ${ALL_SLIDES.length}`);
}

export const CHAPTER_STARTS = [3, 7, 15, 21, 27] as const;
