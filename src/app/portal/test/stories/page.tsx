'use client';

import { z } from 'zod';
import { FormBuilder } from '~/components/platform/FormBuilder';
import { type IHandleSubmit } from '~/components/platform/FormBuilder/types';
import { useToast } from '~/context/ToastProvider';
import { api } from '~/trpc/react';

import { useCallback, useState, use } from 'react';
import CustomForm from './_form/custom-form';

interface Episode {
  id: string;
  name: string;
  order: number;
}

interface Story {
  id: string;
  name: string;
  order: number;
  episodes: Episode[];
}

const EpisodeSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Episode name is required' }),
  order: z.number(),
});

const StorySchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, { message: 'Story name is required' }),
    order: z.number(),
    episodes: z.array(EpisodeSchema).min(1, { message: 'At least one episode is required' }),
  })
  .superRefine((story, ctx) => {
    const seen = new Map<string, number[]>();

    story.episodes.forEach((ep, i) => {
      if (!seen.has(ep.name)) {
        seen.set(ep.name, [i]);
      } else {
        seen.get(ep.name)!.push(i);
      }
    });

    for (const [name, indexes] of seen.entries()) {
      if (indexes.length > 1) {
        indexes.forEach((i) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate episode name`,
            path: ['episodes', i, 'name'],
          });
        });
      }
    }
  });

const FormSchema = z
  .object({
    stories: z
      .array(StorySchema)
      .min(1, { message: 'At least one story is required' }),
  })
  .superRefine((form, ctx) => {
    const seen = new Map<string, number[]>();

    form.stories.forEach((story, i) => {
      if (!seen.has(story.name)) {
        seen.set(story.name, [i]);
      } else {
        seen.get(story.name)!.push(i);
      }
    });

    for (const [name, indexes] of seen.entries()) {
      if (indexes.length > 1) {
        indexes.forEach((i) => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate story name`,
            path: ['stories', i, 'name'],
          });
        });
      }
    }
  });

// const FormSchema = z.object({
//   // Story and Episodes
//   stories: z
//     .array(
//       z.object({
//         id: z.string(),
//         name: z.string().min(1, { message: 'Story name is required' }),
//         order: z.number(),
//         episodes: z.array(
//           z.object({
//             id: z.string(),
//             name: z.string().min(1, { message: 'Episode name is required' }),
//             order: z.number(),
//           }),
//         ),
//       }),
//     )
//     .min(1, { message: 'At least one story is required' }),
// });

export default function FormLabel(props: any) {
  const params = use(props.params) as { shell_type?: "wizard" | "record"; id?: string };

  const {
    defaultValues
  } = props;

  const toast = useToast();

  // Track removed IDs
  const [removedStoryIds, setRemovedStoryIds] = useState<string[]>([]);
  const [removedEpisodeIds, setRemovedEpisodeIds] = useState<string[]>([]);

  const handleSave = useCallback(
    async ({ data, form }: IHandleSubmit<z.infer<typeof FormSchema>>) => {
      try {
        const course_id = params.id;

        toast.success('Stories and episodes saved successfully');
        // Reset tracking after successful save
        setRemovedStoryIds([]);
        setRemovedEpisodeIds([]);
      } catch (error) {
        toast.error('Failed to save stories and episodes');
      }
    },
    [removedStoryIds, removedEpisodeIds],
  );

  return (
    <FormBuilder
      customDesign={{
        formClassName: 'grid !grid-cols-1 gap-4',
      }}
      myParent={params.shell_type}
      formProps={params}
      formLabel="Stories & Episodes"
      handleSubmit={handleSave}
      formKey="episode_details_step_2"
      formSchema={FormSchema}
      defaultValues={defaultValues}
      fields={[]}
      checkboxOptions={{}}
      radioOptions={{}}
      selectOptions={{}}
      multiSelectOptions={{}}
      customRender={(
        formProps,
        options,
        displayType,
        handleUpdateDisplayType,
      ) => (
        <CustomForm
          form={formProps}
          options={options}
          displayType={displayType}
          handleUpdateDisplayType={handleUpdateDisplayType}
          defaultValues={defaultValues}
          onStoryRemoved={(storyId: string) => {
            setRemovedStoryIds((prev) => [...prev, storyId]);
          }}
          onEpisodeRemoved={(episodeId: string) => {
            setRemovedEpisodeIds((prev) => [...prev, episodeId]);
          }}
        />
      )}
    />
  );
}
