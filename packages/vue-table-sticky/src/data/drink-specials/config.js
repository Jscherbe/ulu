// This is column schema/map for the CSV
// This is passed to the demo for configuring the component

export const columns = [
  { 
    name: "Jurisdiction", 
    key: "Jurisdiction" 
  },
  { 
    name: "Date Range",
    key: "Date Range"
  },
  { 
    name: "Prohibited",
    columns: [
      { 
        name: "Multiple Servings at One Time",
        key: "Prohibited: Multiple Servings at One Time"
      },  
      { 
        name: "Multiple Serving for Single Serving Price",
        key: "Prohibited: Multiple Serving for Single Serving Price"
      },   
      { 
        name: "Happy Hours (Reduced Price)",
        columns: [
          { 
            name: "Type of Provision",
            key: "Prohibited: Happy Hours (Reduced Price): Type of Provision"
          },
          { 
            name: "Description",
            key: "Prohibited: Happy Hours (Reduced Price): Description"
          }
        ]
      },
      { 
        name: "Unlimited Beverages for Fixed Price or Period",
        key: "Prohibited: Unlimited Beverages for Fixed Price or Period"
      },
      { 
        name: "Increased Volume Without Increased Price",
        key: "Prohibited: Increased Volume Without Increased Price"
      }
    ]
  },
  { 
    name: "Citations",
    key: "Citations Count"
  }
];