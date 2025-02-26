import { ComboBox } from '~/components/ui/combobox';

export default function Page() {
    return (
        <ComboBox selectOptions={[{
            label: 'Option 1',
            value: 'option-1',
        }, {
            label: 'Option 2',
            value: 'option-2',

        }]} />
    );
}
