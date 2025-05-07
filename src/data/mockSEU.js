 const mockDataForSEU = {
        "type": { //data khi mình chọn loại tải
          "data": [
            { "name": "Điện" },{ "name": "Dầu" }, { "name": "Biomass" },
            { "name": "Chiller" },{ "name": "Lò đốt 1" },{ "name": "Lò đốt 2" },{ "name": "Máy nén" },
            { "name": "Tải khác" }
          ],
       "links" :[
          { "source": "Điện", "target": "Chiller", "value": 10 },
          { "source": "Điện", "target": "Máy nén", "value": 15 },
          { "source": "Điện", "target": "Tải khác", "value": 20 },
          { "source": "Điện", "target": "Lò đốt 1", "value": 12 },
          { "source": "Điện", "target": "Lò đốt 2", "value": 8 },
          { "source": "Dầu", "target": "Lò đốt 2", "value": 5 },
          { "source": "Biomass", "target": "Lò đốt 1", "value": 7 }
       ],
      },
      "location": { //data khi mình chọn địa điểm
        "data": [
          { "name": "Điện" },{ "name": "Dầu" },{ "name": "Biomass" },
          { "name": "Xưởng 1" },{ "name": "Xưởng 2" },{ "name": "Chiller" },
          { "name": "Lò đốt 1" },{ "name": "Lò đốt 2" },{ "name": "Máy nén" },
          { "name": "Tải khác" }
        ],
        
       "links":  [
        { "source": "Điện", "target": "Xưởng 1", "value": 2 },
        { "source": "Biomass", "target": "Xưởng 1", "value": 1 },
        { "source": "Điện", "target": "Xưởng 2", "value": 2 },
        {"source": "Điện", "target": "Xưởng 2", "value": 2 },
        { "source": "Dầu", "target": "Xưởng 2", "value": 1 },
        { "source": "Xưởng 2", "target": "Chiller", "value": 1 },
        { "source": "Xưởng 1", "target": "Lò đốt 1", "value": 2 },
        { "source": "Xưởng 1", "target": "Máy nén", "value": 1 },
        { "source": "Xưởng 2", "target": "Lò đốt 2", "value": 2 },
        { "source": "Điện", "target": "Tải khác", "value": 1 }
      ]
      },
      "emission":[        
        {"Điện":"1152180.45"},
        {"Biomass":"1280200.5"},
        {"Dầu":"128020.05"},
      ],
      "Loads_consumption":{
        "type":{
          "series":[
              {   name: 'Tải khác',
                  data:[ 
                  ["2024-04-01T00:00:00", 210],["2024-04-17T00:00:00", 222],["2024-05-01T00:00:00", 211],["2024-05-17T00:00:00", 224],["2024-06-01T00:00:00", 180],
                  ["2024-06-17T00:00:00", 222],["2024-07-01T00:00:00", 178],["2024-07-17T00:00:00", 240],["2024-08-01T00:00:00", 214],["2024-08-17T00:00:00", 228],
              ]},
              {   name: 'Làm lạnh',
                  data:[ 
                      ["2024-04-01T00:00:00", 110],["2024-04-17T00:00:00", 122],["2024-05-01T00:00:00", 111],["2024-05-17T00:00:00", 124],["2024-06-01T00:00:00", 80],
                      ["2024-06-17T00:00:00", 122],["2024-07-01T00:00:00", 78],["2024-07-17T00:00:00", 140],["2024-08-01T00:00:00", 114],["2024-08-17T00:00:00", 128],
                  ]},
              {   name: 'Tải lò nung',
                  data:[ 
                      ["2024-04-01T00:00:00", 310],["2024-04-17T00:00:00", 322],["2024-05-01T00:00:00", 311],["2024-05-17T00:00:00", 324],["2024-06-01T00:00:00", 280],
                      ["2024-06-17T00:00:00", 322],["2024-07-01T00:00:00", 278],["2024-07-17T00:00:00", 340],["2024-08-01T00:00:00", 314],["2024-08-17T00:00:00", 328],
                  ]},
              {   name: 'Máy nén',
                  data:[ 
                      ["2024-04-01T00:00:00", 10],["2024-04-17T00:00:00", 22],["2024-05-01T00:00:00", 11],["2024-05-17T00:00:00", 24],["2024-06-01T00:00:00", 80],
                      ["2024-06-17T00:00:00", 22],["2024-07-01T00:00:00", 78],["2024-07-17T00:00:00", 40],["2024-08-01T00:00:00", 14],["2024-08-17T00:00:00", 28],
                  ]},
            ]},
      "location":{
          "series":[
              {   name: 'Tải khác',
                  data:[ 
                  ["2024-04-01T00:00:00", 220],["2024-04-17T00:00:00", 232],["2024-05-01T00:00:00", 221],["2024-05-17T00:00:00", 234],["2024-06-01T00:00:00", 190], ["2024-06-17T00:00:00", 232],["2024-07-01T00:00:00", 188],["2024-07-17T00:00:00", 250],["2024-08-01T00:00:00", 224],["2024-08-17T00:00:00", 238], ]},
                { name: 'Làm lạnh',
                  data:[ 
                      ["2024-04-01T00:00:00", 110],["2024-04-17T00:00:00", 122],["2024-05-01T00:00:00", 111],["2024-05-17T00:00:00", 124],["2024-06-01T00:00:00", 80],["2024-06-17T00:00:00", 122],["2024-07-01T00:00:00", 78],["2024-07-17T00:00:00", 140],["2024-08-01T00:00:00", 114],["2024-08-17T00:00:00", 128],]},
                { name: 'Tải lò nung',
                  data:[ 
                      ["2024-04-01T00:00:00", 310],["2024-04-17T00:00:00", 322],["2024-05-01T00:00:00", 311],["2024-05-17T00:00:00", 324],["2024-06-01T00:00:00", 280],["2024-06-17T00:00:00", 322],["2024-07-01T00:00:00", 278],["2024-07-17T00:00:00", 340],["2024-08-01T00:00:00", 314],["2024-08-17T00:00:00", 328]]},
                { name: 'Máy nén',
                  data:[ 
                      ["2024-04-01T00:00:00", 20],["2024-04-17T00:00:00", 32],["2024-05-01T00:00:00", 21],["2024-05-17T00:00:00", 34],["2024-06-01T00:00:00", 80],["2024-06-17T00:00:00", 32],["2024-07-01T00:00:00", 78],["2024-07-17T00:00:00", 50],["2024-08-01T00:00:00", 24],["2024-08-17T00:00:00", 38], ]},
                ]}
      },
      "ConsumptionPercentage":[
        {"Tải khác":"1152180.45"},
        {"Làm lạnh":"1280200.5"},
        {"Tải lò nung":"128020.05"},
        {"Máy nén":"137978.06"}
      ]
    };
  export default mockDataForSEU;
   /* "link": [
          {
            "source": "Điện",
            "target": "Chiller",
            "value": [
              {
                "id": "chiller",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Máy nén",
            "value": [
              {
                "id": "compress",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Tải khác",
            "value": [
              {
                "id": "other",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Lò đốt 1",
            "value": [
              {
                "id": "boiler1",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Lò đốt 2",
            "value": [
              {
                "id": "boiler2",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Dầu",
            "target": "Lò đốt 2",
            "value": [
              {
                "id": "boiler2",
                "ch": "oil"
              }
            ]
          },
          {
            "source": "Biomass",
            "target": "Lò đốt 1",
            "value": [
              {
                "id": "boiler1",
                "ch": "bio"
              }
            ]
          }
        ]*/

  /*"link": [
          {
            "source": "Điện",
            "target": "Xưởng 1",
            "value": [
              {
                "id": "boiler1",
                "ch": "total"
              },
              {
                "id": "compress",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Biomass",
            "target": "Xưởng 1",
            "value": [
              {
                "id": "boiler1",
                "ch": "bio"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Xưởng 2",
            "value": [
              {
                "id": "boiler2",
                "ch": "total"
              },
              {
                "id": "chiller",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Dầu",
            "target": "Xưởng 2",
            "value": [
              {
                "id": "boiler2",
                "ch": "oil"
              }
            ]
          },
          {
            "source": "Xưởng 2",
            "target": "Chiller",
            "value": [
              {
                "id": "chiller",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Xưởng 1",
            "target": "Lò đốt 1",
            "value": [
              {
                "id": "boiler1",
                "ch": "total"
              },
              {
                "id": "boiler1",
                "ch": "bio"
              }
            ]
          },
          {
            "source": "Xưởng 1",
            "target": "Máy nén",
            "value": [
              {
                "id": "compress",
                "ch": "total"
              }
            ]
          },
          {
            "source": "Xưởng 2",
            "target": "Lò đốt 2",
            "value": [
              {
                "id": "boiler2",
                "ch": "total"
              },
              {
                "id": "boiler2",
                "ch": "oil"
              }
            ]
          },
          {
            "source": "Điện",
            "target": "Tải khác",
            "value": [
              {
                "id": "other",
                "ch": "total"
              }
            ]
          }
        ]*/