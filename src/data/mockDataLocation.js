const mockDataLocation = {
    "current": {
        "total": 170,
        "labels": ["Xưởng 1", "Xưởng 2", "Xưởng 3", "Còn lại"],
        "array": [
        {
            "timestamp": "2025-03-20T00:00:00",
            "Xưởng 1": 50,
            "Xưởng 2": 70,
            "Xưởng 3": 30,
            "Còn lại": 20,
        },
        {
            "timestamp": "2025-03-21T00:00:00",
            "Xưởng 1": 80,
            "Xưởng 2": 30,
            "Xưởng 3": 50,
            "Còn lại": 10,
        }
        ]
    },
    "previous": {
        "total": 460,
        "labels": ["Xưởng 1", "Xưởng 2", "Xưởng 3", "Còn lại"],
        "array": [
        {
            "timestamp": "2025-03-20T00:00:00",
            "Xưởng 1": 60,
            "Xưởng 2": 30,
            "Xưởng 3": 90,
            "Còn lại": 50,
        },
        {
            "timestamp": "2025-03-21T00:00:00",
            "Xưởng 1": 50,
            "Xưởng 2": 40,
            "Xưởng 3": 80,
            "Còn lại": 60,
        }
        ]
    },      
}

const mockTreeLocation = 
    [
        {
        value: "A",
        label: "Nhóm A",
        children: [
            {
            value: "A1", 
            label: "Item A1",
            children: [
                {
                value: "A11",
                label: "Item A11",
                children: [
                    {
                    value: "A111",
                    label: "Item A111"
                    }
                ]
                }
            ]
            },
            { value: "A2", label: "Item A2" },
        ],
        },
        {
        value: "B",
        label: "Nhóm B",
        children: [
            { value: "B1", label: "Item B1" },
            { value: "B2", label: "Item B2" },
        ],
        },
    ]

export { mockDataLocation, mockTreeLocation };