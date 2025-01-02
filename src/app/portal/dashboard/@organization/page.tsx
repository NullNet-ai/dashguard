import { snakeCase } from 'lodash'

import { api } from "~/trpc/server";
import FormPieChart from "~/components/platform/FormBuilder/FormType/FormPieChart";

export default async function Page() {

    const data = await api.dashboard.getEntityCountGroupByStatus({
        entity: "organization"
    });

    return (
        <div>
            <FormPieChart 
                entity="organization" 
                // @ts-expect-error - TODO: Need to fix TS issue
                items={Object.entries(data).reduce((acc, [key, value]) => {
                const item_key = snakeCase(key)
                return [
                    ...acc,
                    {
                        key: item_key,
                        label: key,
                        value: value.length,
                        color: {
                            active: "#00BE5A",
                            draft: "#F9922A",
                            archived: "#58697E",
                        }[item_key]
                    }
                ]
            }, [])} />
        </div>
    );
}