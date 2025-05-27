'use client';
import React from 'react';
import { Button } from '~/components/ui/button';
import { GridContext } from '../Provider';
import { testIDFormatter } from '~/utils/formatter';
import * as Lucide from 'lucide-react';

interface DynamicIconProps
  extends React.ComponentProps<typeof Lucide.AlertCircle> {
  name: keyof typeof Lucide;
}

const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  const IconComponent = Lucide[
    name as keyof typeof Lucide
  ] as React.ElementType;

  if (!IconComponent) {
    return <Lucide.Trash2 {...props} />; // Default fallback icon
  }

  return <IconComponent {...props} />;
};

export default function BulkActionButton() {
  const { state, actions } = React.useContext(GridContext);
  const { table, config } = state ?? {};
  const selectedRows = table?.getSelectedRowModel().rows;

  if (!selectedRows?.length) return null;
  const {
    label,
    action_type = 'archive',
    icon = 'Trash',
    ...configProps
  } = config?.customBulkButtonConfig ?? {};

  const IconComponent = (props: React.ComponentProps<any>) => (
    <DynamicIcon name={icon as keyof typeof Lucide} {...props} />
  );

  return (
    <Button
      data-test-id={testIDFormatter(
        `${state?.config.entity}-grd-bulk-action-btn`,
      )}
      Icon={IconComponent}
      className={'flex lg:inline-flex'}
      variant={'destructive'}
      onClick={() => {
        actions?.setShowBulkActionConfirmationModal(true);
        actions?.setBulkActionType(action_type);
      }}
      iconPlacement="left"
      iconClassName="size-4"
      {...configProps}
    >
      {label ? label : 'Archive'}
    </Button>
  );
}
