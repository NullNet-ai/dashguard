import { IFilterGridConfig } from '~/components/platform/FormBuilder/types';
import { IFormProps } from '../../types';
import SelectedView from '../components/SelectedView';
import { defaultAdvanceFilter } from './advanceFilter';
import gridColumns, { FIELD_FILTER_GRID_COLUMNS } from './columns';
import { selectRecord } from '../actions';
import { GLOBAL_ENTITY_NAME } from '../constants';

export default function GridFilterConfig({
  params,
  selectedRecords,
}: IFormProps) {
  const filterGridConfig: IFilterGridConfig = {
    selectedRecords,
    // Enable Selectable Record Status
    statusesIncluded: ['Draft'],
    actionType: 'single-select',
    pluck: params?.pluck_fields,
    filter_entity: params?.entity!,
    is_same_entity_id: true,
    main_entity_id: params.id,
    gridColumns,
    fieldFilterGridColumns: FIELD_FILTER_GRID_COLUMNS,
    current: 1,
    limit: 1000,
    label: GLOBAL_ENTITY_NAME,
    hideSearch: false,
    searchConfig: {
      // ! Connect your TRPC api here
      // router: 'contact',
      // resolver: 'mainGrid',
      // query_params: {
      //   entity: 'contact',
      //   pluck: params?.pluck_fields,
      //   default_advance_filters: defaultAdvanceFilter,
      //   default_sorting: [
      //     {
      //       id: 'created_date',
      //       desc: true,
      //       sort_key: 'created_date',
      //     },
      //   ],
      // },
    },
    // onClipboardPaste: (data, form, onSubmitFormGrid) => { // to modify pasting data
    //   form.reset(data, {
    //     keepDefaultValues: true,
    //   });

    //   form.handleSubmit((data: any) =>
    //     onSubmitFormGrid(data, { action_type: "Paste" }),
    //   )();
    // },
    async onSelectRecords({ filter_entity, main_entity_id, rows }) {
      return {
        rows,
        filter_entity,
        main_entity_id,
      };
    },
    // async onRemoveSelectedRecords({ filter_entity, main_entity_id, rows }) {
    //   return {
    //     rows: [],
    //     filter_entity,
    //     main_entity_id: '',
    //   };
    // },
    // onFilterFieldChange: (search_params, options) => {
    //   const { data } = api.contact.mainGrid.useQuery(search_params, options);
    //   return data;
    // },
    // handleSelectFieldFilterGrid: (data) => {
    //   const { raw_phone_number, iso_code, country_code, email, ...rest } =
    //     data ?? {};
    //   const resolvedData = {
    //     ...rest,
    //     phone: [
    //       {
    //         raw_phone_number,
    //         iso_code,
    //         country_code,
    //       },
    //     ],
    //     email: [
    //       {
    //         email,
    //       },
    //     ],
    //   };
    //   return resolvedData;
    // },
    // ! Selected Component
    // renderComponentSelected: (record) => {
    //   // Selected View Component
    //   return <SelectedView record={record} />;
    // },
  };

  return filterGridConfig;
}
