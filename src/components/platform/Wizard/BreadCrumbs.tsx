'use client';

import { useContext } from 'react';
import { WizardContext } from './Provider';
import { BreadcrumbSeparator } from '~/components/ui/breadcrumb';
import { testIDFormatter } from '~/utils/formatter';

export default function WizardNavigator() {
  const { state } = useContext(WizardContext);
  const { entityName, stepLabels, title } = state ?? {};
  const modified_entity = entityName === 'user_role' ? 'role' : entityName;
  const formatEntitiyName = title
    ? title
    : modified_entity
        ?.split('_')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
  const wizard_step_title = `${formatEntitiyName} `;
  const currentStep = state?.currentStep;
  const stepLabel = currentStep !== undefined ? (stepLabels?.[currentStep] ?? '') : '';

  return (
    <div data-testid={testIDFormatter('wizard-navigator')}>
      <nav
        aria-label="breadcrumb"
        data-testid={testIDFormatter(`${entityName}-breadcrumb-nav`)}
        className="text-slate-800"
      >
        <ol 
          className="flex items-center gap-2 font-semibold" 
          data-testid={testIDFormatter(`${entityName}-breadcrumb-list`)}
        >
          <li data-testid={testIDFormatter(`${entityName}-breadcrumb-title`)}>
            <span
              className="text-md"
              data-testid={testIDFormatter(`${entityName}-wizard-title`)}
            >
              {wizard_step_title}
            </span>
          </li>
          <BreadcrumbSeparator className="text-slate-800" />
          <li data-testid={testIDFormatter(`${entityName}-breadcrumb-step`)}>
            <span
              className="text-md text-slate-800"
              data-testid={testIDFormatter(`${entityName}-step-${currentStep}-${stepLabel}`)}
            >
              Step {currentStep} - {stepLabel}
            </span>
          </li>
        </ol>
      </nav>
    </div>
  );
}
