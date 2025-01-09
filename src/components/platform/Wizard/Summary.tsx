'use client'

import { useContext, useEffect } from "react";
import { WizardContext } from "./Provider";
import useScreenType from "~/hooks/use-screen-type";
import { cn } from "~/lib/utils";
import { ChevronLeftIcon } from "lucide-react";
const FORM_HEADER_HEIGHT = "44px";
import { Button as Button2 } from "@headlessui/react";
import Stepper from "./Stepper";
import { camelCase } from "lodash";
import { testIDFormatter } from "~/utils/formatter";

const SummaryComponent = () => {

    const summaryContext = useContext(WizardContext)
    const {state,actions} = summaryContext;
    const { entityName  } = state ?? {}
    const screenType = useScreenType()
  
    useEffect(() => {
      if(screenType === "md") {
        actions?.handleSummaryToggle(false)
      }
    }, [screenType])
  
    const handleToggle = () => { 
      actions?.handleSummaryToggle(!state?.isSummaryOpen)
    }
    
  
    return (
      <div className={
        cn(` border-r sticky top-0  transform transition-all duration-100`, 
        state?.isSummaryOpen ? 'lg:w-64 md:w-52 sm:w-48' : 'w-[44px] pt-2' )}
        >
        <div
          data-test-id={testIDFormatter(`${entityName}-wzrdsum`)}
          className={cn('flex items-center justify-between  z-10',
            state?.isSummaryOpen ? 'flex-row px-[12px] border-b' : 'flex-col-reverse justify-end gap-6 border-b mb-2'
  
          )}
          style={{ height:  (state?.isSummaryOpen ) ? FORM_HEADER_HEIGHT : 124 }}
        >
          <span className={cn('text-sm font-bold', !state?.isSummaryOpen ? '-rotate-90 w-[80px] ml-[-3px]' : '')}>Summary</span>
          <Button2 
            onClick={() => {
              handleToggle()
            }} 
            className={cn(`${!state?.isSummaryOpen ? 'mt-2' : ''}`,
            'font-bold flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-primary')
          }
            data-test-id={testIDFormatter(`${entityName}-wzrdsum-toggle-btn`)}
          >
            <ChevronLeftIcon className="h-3 w-3" />
          </Button2>
        </div>
        <Stepper />
      </div>
    );
  }

  export default SummaryComponent