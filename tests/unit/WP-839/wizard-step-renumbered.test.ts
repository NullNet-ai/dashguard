import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

// WP-839 — Role Wizard: remove Step 2 (Category Details) and renumber
// Confirmation from step 3 to step 2.
//
// Owner's confirmation (comment 14308): "Confirm removing the current Step 2.
// Then the current Step 3 would be Step 2 now." So Confirmation must stay
// reachable — this is a renumber, NOT a collapse to a single step.
//
// These assertions read the LIVE config. `user_role/wizard/_config/*` is dead
// code for this wizard — nothing imports it — and an earlier plan for this very
// ticket was built on those files and got the step count wrong as a result. The
// real config is hardcoded inline in `wizard/[code]/layout.tsx`, which is what
// is asserted here.

const WIZARD = join(
  process.cwd(),
  'src/app/portal/(settings)/user_role/wizard',
);

const read = (relative: string) => readFileSync(join(WIZARD, relative), 'utf8');

describe('WP-839 — Role wizard step 2 removed, Confirmation renumbered', () => {
  const layout = read('[code]/layout.tsx');

  it('declares two steps, not three and not one', () => {
    expect(layout).toContain('totalSteps: 2');
    expect(layout).not.toContain('totalSteps: 3');
    // Guards the collapse misreading that was explicitly rejected.
    expect(layout).not.toContain('totalSteps: 1');
  });

  it('labels step 2 as Confirmation and drops Category Details', () => {
    expect(layout).toContain("1: 'Basic Details'");
    expect(layout).toContain("2: 'Confirmation'");
    // Match the label entry, not the bare words — the file's own comment
    // explains that Category Details was removed and would false-positive here.
    expect(layout).not.toContain("2: 'Category Details'");
    expect(layout).not.toContain("3: 'Confirmation'");
  });

  it('mounts Confirmation at step 2 on disk', () => {
    expect(existsSync(join(WIZARD, '[code]/2/@confirmationdetails'))).toBe(true);
    // The old category-details step must be gone, not merely unreachable.
    expect(existsSync(join(WIZARD, '[code]/2/@categorydetails'))).toBe(false);
    // Nothing may be left at step 3 — a stray route there would be dead weight
    // and would resurface the "unreachable step" confusion this ticket cleared.
    expect(existsSync(join(WIZARD, '[code]/3'))).toBe(false);
  });

  it('keeps the summary panel keys aligned with the new step numbers', () => {
    const summary = read('(summary)/wizard-summary-config.tsx');
    expect(summary).toContain('one:');
    expect(summary).toContain('two:');
    // `three` would now point past the end of the wizard.
    expect(summary).not.toContain('three:');
    expect(existsSync(join(WIZARD, '(summary)/_3'))).toBe(false);
  });

  it('no longer renders the CategoryDetails form anywhere in the wizard', () => {
    // The form component itself is intentionally left in place (flagged as a
    // separate cleanup); what must be gone is any wizard route mounting it.
    const stepTwoPage = read('[code]/2/@confirmationdetails/page.tsx');
    expect(stepTwoPage).not.toContain('CategoryDetails');
  });
});
