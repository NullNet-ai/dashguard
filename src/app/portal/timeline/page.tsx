'use client'
import { useMainPageEvaluator } from '~/hooks/useMainPageEvaluator';

export default function Page() {
  useMainPageEvaluator();
  return null;
}
