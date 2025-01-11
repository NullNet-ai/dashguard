"use client";

import { id } from "date-fns/locale";
import { set, uniqueId } from "lodash";
import React, { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const custom_data = [
  {
    id: "11111",
    name: "John Doe",
    age: 20,
    hidden: false,
  },
  {
    id: "22222",
    name: "Doe John",
    age: 30,
    hidden: false,
  },
  {
    id: "333333",
    name: "Jane Curz",
    age: 25,
    hidden: false,
  },
  {
    id: "444444",
    name: "Curzssd Jane",
    age: 35,
    hidden: false,
  },
  {
    id: "666666",
    name: "sdsds2323d Jane",
    age: 35,
    hidden: false,
  },
];

const DynamicList = () => {
  const [data, setData] = useState<typeof custom_data>(custom_data);


  const conref = React.useRef<HTMLDivElement>(null);
  const inner = React.useRef<HTMLDivElement>(null);


  const calc =  () => {
    if (inner.current?.offsetWidth && conref.current?.offsetWidth) {
        if (inner.current?.offsetWidth > conref.current?.offsetWidth) {
              setData((prev) => {
                  const last = prev[prev.length - 1];
                  
                  const newData = prev.map((item) => {
                      if(item.id === last?.id) {
                          return {
                              ...item,
                              hidden: true
                          }
                      }
                      return item;
                  });
                  return newData;
              });
        }else {
            
        }
      }
  }



  useEffect(() => {
    calc();
  }, []);



  const randomNumbers = () => {
    return Math.floor(Math.random() * 1023231230).toString();
  }

  const handleAdd = () => {
    setData([...data, { id:  randomNumbers(), name: "New Item", age: 40, hidden: false }]);
    setTimeout(() => {
        calc();
    }, 100);
  };

  const removeData = (item: typeof custom_data[0]) => {
    const filtered = data.filter((i) => i.id !== item.id).map((i) => {
        return {
            ...i,
            hidden: false
        }
    });
    setData(filtered);    
    setTimeout(() => {
        calc();
    }, 100);
  }

  return (
    <div className="flex justify-between p-4">
      <div>
        <h1>Dynamic</h1>

        <div
          className="flex h-[100px] w-[400px] overflow-hidden border border-red-200 p-2"
          ref={conref}
        >
          <div className="flex flex-row gap-2 self-start text-sm bg-red-200" ref={inner}>
            {data?.map((item, index) => {
          
              return (
                <div
                  key={item.id}
                  className={cn(`whitespace-nowrap rounded-md border border-gray-200 p-1`,
                    { 'opacity-0': item.hidden }
                  )}

                >
                  {item.name} {item.id}
                  <button
                    className="ml-2"
                    onClick={() => {
                        removeData(item);
                    }}
                  >
                    X
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <button
          className="my-2"
          onClick={() => {
            handleAdd();
          }}
        >
          Add Item
        </button>
        <div className="flex flex-col gap-2 self-start text-sm">
          {data?.map((item, index) => {
            if (!item.hidden) {
              return null;
            }
            return (
              <div
                key={item.id}
                className="self-start whitespace-nowrap rounded-md border border-gray-200 p-1"
              >
                {item.name} {item.id}
                <button
                  className="ml-2"
                  onClick={() => {
                    setData((prev) =>
                      prev.filter((i) => i.id !== item.id)
                    );
                  }}
                >
                  X
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-xs">
        <h2 className="text-lg mb-4">Debugger</h2>
        <div className="flex gap-4">
          <div>
            <div>
              Data ({data.length})
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
        
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicList;
