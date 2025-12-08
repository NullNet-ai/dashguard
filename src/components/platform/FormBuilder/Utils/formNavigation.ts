'use client';

import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';
import NavigateAction from './navigateServer';
import { UseFormReturn } from 'react-hook-form';

// Types for the state machine
type NavigationType = 'client' | 'server';

type WizardConfig = {
  NAVIGATION_TYPE?: NavigationType;
  CUSTOM_NEXT_NAVIGATE_HREF?: string;
};

type FormStateMachineConfig = {
  create: {
    invoke: () => Promise<{
      code: string;
      data: any;
    }>;
    validate?: (response: any) => Promise<any> | null | undefined;
    toast_message?: string;
  };
  update: {
    invoke: () => Promise<{
      code: string;
      data: any;
    }>;
    validate?: (response: any) => Promise<any> | null | undefined;
    toast_message?: string;
  };
  wizard: {
    new: WizardConfig;
    code: WizardConfig;
  };
  record?: any;
};

/**
 * Form Navigation State Machine
 * This utility helps manage form navigation based on a state machine approach
 */
export const useFormNavigationStateMachine = () => {
  // Integrate the API calls directly into the state machine
  const pathname = usePathname();
  const [, , main_entity, application, identifier] = pathname.split('/');
  const toast = useToast();
  const router = useRouter();
  const createRecordContext =
    api.wizard.createRedisRecordsForFormFilter.useMutation();
  const currentContext = '/portal/' + main_entity;
  const updateNewInnerTabs = api.tab.updateNewInnerTabs.useMutation();

  const navigateServer = (href: string) => {
    console.debug('[href]', href);
    NavigateAction(href);
    return;
  };

  const navigateClient = (href: string) => {
    console.debug('[href]', href);
    router.push(href);
  };

  const handleFormSubmission = async ({
    action_type,
    stateMachine,
  }: {
    action_type?:
      | 'Create'
      | 'Paste'
      | 'Next'
      | 'Pristine:Next'
      | null
      | undefined;
    stateMachine: FormStateMachineConfig;
  }) => {
    try {
      let response;
      console.debug('State Machine: Start');

      // Determine if we're creating or updating
      if (identifier === 'new' && stateMachine.create) {
        console.debug('State Machine: Create flow');
        // Execute the create function from the state machine
        response = await stateMachine.create.invoke();
        console.debug('State Machine: Create response received', response);

        if (stateMachine.create.validate) {
          const validated = await stateMachine.create.validate(response?.data);
          if (validated) {
            return validated;
          }
        }

        if (response?.code && application === 'wizard') {
          console.debug('State Machine: Create success in wizard');
          toast.success(
            stateMachine.create.toast_message ||
              `${main_entity} details submitted successfully`,
          );

          // Remove inner class tab if needed
          console.debug('State Machine: Removing inner class tab');
          // await removeInnerClassTab.mutateAsync({
          //   current_context: currentContext,
          // });
          await updateNewInnerTabs.mutateAsync({
            current_context: currentContext,
            code: response?.code,
          });
          console.debug('State Machine: Inner class tab removed');

          console.debug('State Machine: Creating record context');
          await createRecordContext.mutateAsync({
            entity: main_entity!,
            code: response?.code,
          });
          console.debug('State Machine: Record context created');

          // Handle Next action in wizard
          if (['Next'].includes(action_type || '')) {
            console.debug('State Machine: Create - Next action');
            toast.success(
              stateMachine.create.toast_message ||
                `${main_entity} details saved successfully`,
            );

            // Determine navigation type and path
            const navConfig = stateMachine.wizard?.new || {};
            const navType = navConfig.NAVIGATION_TYPE || 'server';
            const customHref =
              navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
              `/portal/${main_entity}/wizard/${response?.code}/2`;

            // Navigate based on type
            console.debug(`State Machine: Navigating (${navType})`);
            if (navType === 'server') {
              navigateServer(customHref);
            } else {
              navigateClient(customHref);
            }
            return;
          }
          if (['Create', 'Paste'].includes(action_type || '')) {
            console.debug('State Machine: Create - Next action');
            toast.success(
              stateMachine.create.toast_message ||
                `${main_entity} details saved successfully`,
            );

            console.debug('State Machine: Creating record context');
            await createRecordContext.mutateAsync({
              entity: main_entity!,
              code: response?.code,
            });
            console.debug('State Machine: Record context created');

            // Determine navigation type and path
            const navConfig = stateMachine.wizard?.new || {};
            const navType = navConfig.NAVIGATION_TYPE || 'server';
            const customHref =
              navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
              `/portal/${main_entity}/wizard/${response?.code}/1`;

            // Navigate based on type
            console.debug(`State Machine: Navigating (${navType})`);
            if (navType === 'server') {
              navigateServer(customHref);
            } else {
              navigateClient(customHref);
            }
            return;
          }

          // Default navigation (not Next action)
          console.debug('State Machine: Create - Default navigation');
          const navConfig = stateMachine.wizard?.new || {};
          const navType = navConfig.NAVIGATION_TYPE || 'server';
          const customHref =
            navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
            `/portal/${main_entity}/wizard/${response?.code}/1`;

          console.debug(`State Machine: Navigating (${navType})`);
          if (navType === 'server') {
            navigateServer(customHref);
          } else {
            navigateClient(customHref);
          }
          return;
        }
      } else if (stateMachine.update) {
        console.debug('State Machine: Update flow');
        // Handle Pristine:Next case for wizard
        if (action_type === 'Pristine:Next' && application === 'wizard') {
          console.debug('State Machine: Pristine:Next in wizard');
          const navConfig = stateMachine.wizard?.code || {};
          const navType = navConfig.NAVIGATION_TYPE || 'server';
          const customHref =
            navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
            `/portal/${main_entity}/wizard/${identifier}/2`;

          console.debug(`State Machine: Pristine navigating (${navType})`);
          if (navType === 'server') {
            navigateServer(customHref);
          } else {
            navigateClient(customHref);
          }
          return;
        }

        // Execute the update function from the state machine
        console.debug('State Machine: Executing update');
        response = await stateMachine.update.invoke();
        console.debug('State Machine: Update response received');
        if (stateMachine.update.validate) {
          const validated = await stateMachine.update.validate(response?.data);
          if (validated) {
            return validated;
          }
        }
        if (response) {
          console.debug('State Machine: Update success');
          toast.success(
            stateMachine.update.toast_message ||
              `${main_entity} details submitted successfully`,
          );

          // If it's a record type, just return
          if (application === 'record') {
            console.debug('State Machine: Record type - returning');
            return;
          }

          // Handle Next action in wizard
          if (action_type === 'Next') {
            console.debug('State Machine: Update - Next action');
            toast.success(
              stateMachine.update.toast_message ||
                `${main_entity} details saved successfully`,
            );

            console.debug('State Machine: Creating record context');
            await createRecordContext.mutateAsync({
              entity: main_entity!,
              code: response?.code,
            });
            console.debug('State Machine: Record context created');

            // Determine navigation type and path
            const navConfig = stateMachine.wizard?.code || {};
            const navType = navConfig.NAVIGATION_TYPE || 'server';
            const customHref =
              navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
              `/portal/${main_entity}/wizard/${response?.code}/2`;

            // Navigate based on type
            console.debug(`State Machine: Navigating (${navType})`);
            if (navType === 'server') {
              navigateServer(customHref);
            } else {
              navigateClient(customHref);
            }
            return;
          }

          // Default navigation (not Next action)
          console.debug('State Machine: Update - Default navigation');
          const navConfig = stateMachine.wizard?.code || {};
          const navType = navConfig.NAVIGATION_TYPE || 'server';
          const customHref =
            navConfig.CUSTOM_NEXT_NAVIGATE_HREF ||
            `/portal/${main_entity}/wizard/${response?.code}/1`;

          console.debug(`State Machine: Navigating (${navType})`);
          if (navType === 'server') {
            navigateServer(customHref);
          } else {
            navigateClient(customHref);
          }
          return;
        } else {
          console.debug('State Machine: Update failed - no response');
          toast.error(`Failed to submit ${main_entity} details`);
        }
      }
      console.debug('State Machine: End of process');
    } catch (error: any) {
      if (error.message === 'NEXT_REDIRECT') return
      console.error('State Machine: Error occurred', error);
      console.debug('State Machine: Error occurred');
      toast.error(`Failed to submit ${main_entity} details`);
    }
  };

  return { handleFormSubmission };
};
