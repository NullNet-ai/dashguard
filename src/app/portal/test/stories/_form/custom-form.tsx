import React, { Fragment, useCallback } from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { TDisplayType } from '~/components/platform/FormBuilder/types';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { FormMessage } from '~/components/ui/form';
import {
  Sortable,
  SortableItem,
  SortableDragHandle,
} from '~/components/ui/sortable';
import { Trash2, Plus, GripVertical } from 'lucide-react';
import { ulid } from 'ulid';
import { cn } from '~/lib/utils';
import { Alert, AlertContent, AlertTitle } from '~/components/ui/alert';

interface IProps {
  form: UseFormReturn<Record<string, any>, any, undefined>;
  options: {
    appendButtonKey?: string;
  };
  displayType: TDisplayType;
  handleUpdateDisplayType: (type: TDisplayType) => void;
  defaultValues?: Record<string, any>;
  onStoryRemoved?: (storyId: string) => void;
  onEpisodeRemoved?: (episodeId: string) => void;
}

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

interface IErrors {
  root: {
    message: string;
  };
  name: {
    message: string;
  };
  episodes: {
    name: {
      message: string;
    };
  }[];
}

export default function CustomForm(args: IProps) {
  const {
    form,
    options,
    displayType,
    handleUpdateDisplayType,
    defaultValues,
    onStoryRemoved,
    onEpisodeRemoved,
  } = args;

  // Use useFieldArray for stories
  const {
    fields: stories,
    append: appendStory,
    remove: removeStory,
    move: moveStory,
  } = useFieldArray({
    control: form.control,
    name: 'stories',
    keyName: 'id',
  });



  const errors = form?.formState?.errors?.stories as unknown as IErrors[];
  // If has episode array then error message in on the episode
  // If has no episode array then error message in on the story

  // Helper function to get story error message
  const getStoryErrorMessage = (storyIndex: number) => {
    const storyErrors = errors?.[storyIndex];
    if (!storyErrors) return null;

    // Always show story name error if it exists, regardless of episodes
    return storyErrors.name?.message;
  };

  // Helper function to get episode error message
  const getEpisodeErrorMessage = (storyIndex: number, episodeIndex: number) => {
    return errors?.[storyIndex]?.episodes?.[episodeIndex]?.name?.message;
  };

  // Function to reorder stories after changes
  const reorderStories = () => {
    const currentStories = form.getValues('stories') || [];
    const updatedStories = currentStories.map(
      (story: Story, index: number) => ({
        ...story,
        order: index + 1,
      }),
    );
    form.setValue('stories', updatedStories, {
      shouldDirty: true,
    });
  };

  // Function to reorder episodes within a story
  const reorderEpisodes = (storyIndex: number) => {
    const currentStories = form.getValues('stories') || [];
    const updatedStories = [...currentStories];

    if (updatedStories[storyIndex]?.episodes) {
      // Remove the automatic order reassignment - let episodes keep their original order values
      // Only update the form value without changing the order property
      form.setValue('stories', updatedStories, {
        shouldDirty: true,
      });
    }
  };

  // Function to add a new story
  const addNewStory = () => {
    const currentStories = form.getValues('stories') || [];
    const newOrder = currentStories.length + 1;

    appendStory({
      id: ulid(),
      name: '',
      order: newOrder,
      episodes: [],
    });
  };

  // Function to add a new episode to a specific story
  const addEpisodeToStory = (storyIndex: number) => {
    const currentStories = form.getValues('stories') || [];
    const updatedStories = [...currentStories];

    if (!updatedStories[storyIndex]) {
      updatedStories[storyIndex] = {
        id: ulid(),
        name: '',
        order: storyIndex + 1,
        episodes: [],
      };
    }

    if (!updatedStories[storyIndex].episodes) {
      updatedStories[storyIndex].episodes = [];
    }

    const newEpisodeOrder = updatedStories[storyIndex].episodes.length + 1;

    updatedStories[storyIndex].episodes.push({
      id: ulid(),
      name: '',
      order: newEpisodeOrder,
    });

    form.setValue('stories', updatedStories, {
      shouldDirty: true,
    });
  };

  // Function to remove an episode from a specific story
  const removeEpisodeFromStory = (storyIndex: number, episodeIndex: number) => {
    const currentStories = form.getValues('stories') || [];
    const updatedStories = [...currentStories];

    if (updatedStories[storyIndex]?.episodes) {
      const episodeToRemove = updatedStories[storyIndex].episodes[episodeIndex];

      // Track the removed episode ID if it exists (not a new episode)
      if (episodeToRemove?.id && onEpisodeRemoved) {
        onEpisodeRemoved(episodeToRemove.id);
      }

      updatedStories[storyIndex].episodes.splice(episodeIndex, 1);
      form.setValue('stories', updatedStories, {
        shouldDirty: true,
      });
      // Reorder episodes after removal
      setTimeout(() => reorderEpisodes(storyIndex), 0);
    }
  };

  // Function to remove a story
  const handleRemoveStory = (storyIndex: number) => {
    const currentStories = form.getValues('stories') || [];
    const storyToRemove = currentStories[storyIndex];

    // Track the removed story ID if it exists (not a new story)
    if (storyToRemove?.id && onStoryRemoved) {
      onStoryRemoved(storyToRemove.id);

      // Also track all episodes within this story as removed
      if (storyToRemove.episodes && onEpisodeRemoved) {
        storyToRemove.episodes.forEach((episode: Episode) => {
          if (episode.id) {
            onEpisodeRemoved(episode.id);
          }
        });
      }
    }

    removeStory(storyIndex);
    // Reorder stories after removal
    setTimeout(() => reorderStories(), 0);
  };

  // Function to update episode name
  const updateEpisodeName = (
    storyIndex: number,
    episodeIndex: number,
    name: string,
  ) => {
    const currentStories = form.getValues('stories') || [];
    const updatedStories = [...currentStories];

    if (updatedStories[storyIndex]?.episodes?.[episodeIndex]) {
      updatedStories[storyIndex].episodes[episodeIndex].name = name;
      form.setValue('stories', updatedStories);
    }
  };

  // Function to handle story reordering
  const handleStoryMove = ({
    activeIndex,
    overIndex,
  }: {
    activeIndex: number;
    overIndex: number;
  }) => {
    moveStory(activeIndex, overIndex);
    // Reorder stories after move
    setTimeout(() => reorderStories(), 0);
  };

  // Function to handle episode reordering within a story
  const handleEpisodeMove = useCallback(
    (storyIndex: number, activeIndex: number, overIndex: number) => {
      if (form?.formState?.disabled) {
        return;
      }
      const currentStories = form.getValues('stories') || [];
      const updatedStories = [...currentStories];

      if (updatedStories[storyIndex]?.episodes) {
        const episodes = [...updatedStories[storyIndex].episodes];
        const [movedEpisode] = episodes.splice(activeIndex, 1);
        episodes.splice(overIndex, 0, movedEpisode);

        // Update the order property to match the new positions
        const reorderedEpisodes = episodes.map((episode, index) => ({
          ...episode,
          order: index + 1,
        }));

        updatedStories[storyIndex].episodes = reorderedEpisodes;
        form.setValue('stories', updatedStories, {
          shouldDirty: true,
        });
      }
    },
    [form?.formState?.disabled],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    storyIndex: number,
    episodeIndex: number
  ) => {
    if (
      e.key === 'Enter' &&
      !form?.formState?.disabled &&
      e.currentTarget.value.trim() !== ''
    ) {
      e.preventDefault();
      addEpisodeToStory(storyIndex);

      // // Focus the next input after a short delay to ensure it exists
      // setTimeout(() => {
      //   const nextIndex = episodeIndex + 1;
      //   if (episodeInputRefs.current[nextIndex]) {
      //     episodeInputRefs.current[nextIndex]?.focus();
      //   }
      // }, 50);
    }
  };


  
  return (
    <div className="my-6 space-y-6">
      {!form?.formState?.disabled && (
        <div className="flex items-center justify-start">
          <Button
            size={'sm'}
            type="button"
            onClick={addNewStory}
            className="flex items-center gap-2"
            disabled={form?.formState?.disabled}
          >
            <Plus className="h-4 w-4" />
            Add New Story
          </Button>
        </div>
      )}

      {form?.formState?.errors?.stories?.message && (
        <Alert variant={'error'}>
          <AlertTitle>There is an error with the stories</AlertTitle>
          <AlertContent>
            {(form?.formState?.errors?.stories?.message as string) ||
              'Please check the form for errors.'}
          </AlertContent>
        </Alert>
      )}

      {stories.length === 0 && (
        <Card className="border-none shadow-none">
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No stories yet.{' '}
              {!form?.formState?.disabled &&
                'Click "Add New Story" to get started.'}
            </div>
          </CardContent>
        </Card>
      )}

      <Sortable
        value={(stories as Story[]).map((story) => ({ id: story.id }))}
        onMove={form?.formState?.disabled ? undefined : handleStoryMove}
        overlay={null}
      >
        {(stories as Story[]).map((story, storyIndex) => {
          const storyData = story as Story;
          const episodes = form.watch(`stories.${storyIndex}.episodes`) || [];
          const storyErrorMessage = getStoryErrorMessage(storyIndex);

          return (
            <SortableItem key={storyData.id} value={storyData.id}>
              <Card className="border-b-0 border-l-2 border-r-0 border-t-0 border-blue-500 shadow-none">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-3">
                    {!form?.formState?.disabled && (
                      <div>
                        <SortableDragHandle className="bg-white hover:bg-blue-50">
                          <GripVertical className="h-5 w-5 cursor-move text-muted-foreground" />
                        </SortableDragHandle>
                      </div>
                    )}
                    <span className="mt-1 rounded py-1 text-sm text-muted-foreground">
                      Story:
                    </span>
                    <div className="flex-1">
                      <Input
                        placeholder="Story name..."
                        {...(() => {
                          const { disabled, ...rest } = form.register(
                            `stories.${storyIndex}.name`,
                          );
                          return rest;
                        })()}
                        className={cn(
                          'text-lg font-medium',
                          'disabled:bg-white disabled:text-black',
                          storyErrorMessage && 'border-red-500',
                        )}
                        disabled={false}
                        readOnly={form?.formState?.disabled}
                      />
                      {storyErrorMessage && (
                        <FormMessage>{storyErrorMessage}</FormMessage>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {!form?.formState?.disabled && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addEpisodeToStory(storyIndex)}
                            className="flex items-center gap-1"
                            disabled={form?.formState?.disabled}
                          >
                            <Plus className="h-3 w-3" />
                            Add Episode
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveStory(storyIndex)}
                            disabled={
                              form?.formState?.disabled || episodes.length > 0
                            }
                            title={
                              episodes.length > 0
                                ? 'Cannot remove story with episodes. Remove all episodes first.'
                                : ''
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {episodes.length === 0 ? (
                    <Fragment>
                      {
                        // @ts-expect-error TODO
                        form?.formState?.errors?.stories?.[`${storyIndex}`]
                          ?.episodes?.message && (
                          <Alert variant={'error'}>
                            <AlertTitle>
                              There is an error with the episodes
                            </AlertTitle>
                            <AlertContent>
                              {(((form?.formState?.errors?.stories &&
                                // @ts-expect-error TODO
                                form?.formState?.errors?.stories?.[storyIndex]
                                  ?.episodes?.message) ||
                                '') as string) ||
                                'Please check the form for errors.'}
                            </AlertContent>
                          </Alert>
                        )
                      }
                      <div className="rounded-lg border-dashed py-8 text-center text-muted-foreground">
                        No episodes yet.{' '}
                        {!form?.formState?.disabled &&
                          'Click "Add Episode" to create the first episode.'}
                      </div>
                    </Fragment>
                  ) : (
                    <Sortable
                      value={(episodes as Episode[]).map(
                        (episode: Episode) => ({
                          id: episode.id,
                        }),
                      )}
                      onMove={
                        form?.formState?.disabled
                          ? undefined
                          : ({ activeIndex, overIndex }) =>
                              handleEpisodeMove(
                                storyIndex,
                                activeIndex,
                                overIndex,
                              )
                      }
                      overlay={null}
                    >
                      <div className="space-y-3">
                        {(episodes as Episode[]).map(
                          (episode: Episode, episodeIndex: number) => {
                            const episodeErrorMessage = getEpisodeErrorMessage(
                              storyIndex,
                              episodeIndex,
                            );

                            return (
                              <SortableItem
                                className="ml-11 border-none"
                                key={episode.id}
                                value={episode.id}
                              >
                                <div className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                  {!form?.formState?.disabled && (
                                    <div>
                                      <SortableDragHandle className="bg-white hover:bg-blue-50">
                                        <GripVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                                      </SortableDragHandle>
                                    </div>
                                  )}
                                  <span className="mt-1 rounded py-1 text-xs text-muted-foreground">
                                    Episode:
                                  </span>
                                  <div className="flex-1">
                                    <Input
                                      placeholder={`Episode ${episodeIndex + 1} name...`}
                                      {...(() => {
                                        const { disabled, ...rest } =
                                          form.register(
                                            `stories.${storyIndex}.episodes.${episodeIndex}.name`,
                                          );
                                        return rest;
                                      })()}
                                
                                        onKeyDown={e => handleKeyDown(e, storyIndex, episodeIndex)}
                                      disabled={false}
                                      className={cn(
                                        'bg-background',
                                        'disabled:bg-white disabled:text-black',
                                        episodeErrorMessage && 'border-red-500',
                                      )}
                                      readOnly={form?.formState?.disabled}
                                    />
                                    {episodeErrorMessage && (
                                      <FormMessage>
                                        {episodeErrorMessage}
                                      </FormMessage>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 pt-1">
                                    {!form?.formState?.disabled && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeEpisodeFromStory(
                                            storyIndex,
                                            episodeIndex,
                                          )
                                        }
                                        className="text-destructive hover:text-destructive"
                                        disabled={form?.formState?.disabled}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </SortableItem>
                            );
                          },
                        )}
                      </div>
                    </Sortable>
                  )}
                </CardContent>
              </Card>
            </SortableItem>
          );
        })}
      </Sortable>
    </div>
  );
}
