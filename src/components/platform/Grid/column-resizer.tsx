import { type Header } from '@tanstack/react-table';

export const ColumnResizer = ({ header }: { header: Header<any, unknown> }) => {
  // if (header.column.getCanResize() === false) return <></>;

  return (
    <div
      {...{
        onMouseDown: header.getResizeHandler(),
        onTouchStart: header.getResizeHandler(),
        className: `absolute  border-r   top-[50%] translate-y-[-50%] right-0 cursor-col-resize w-px h-full bg-background  hover:bg-sky-700 hover:w-1 hover:h-10 hover:rounded-lg`,
        // className: `absolute top-[50%] translate-y-[-50%] right-0 cursor-col-resize w-px h-full  border  hover:bg-sky-700 hover:w-1 hover:h-10 hover:rounded-lg`,
        style: {
          userSelect: 'none',
          touchAction: 'none',
        },
      }}
    />
  );
};
