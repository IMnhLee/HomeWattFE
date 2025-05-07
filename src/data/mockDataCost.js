// const mockDataCost = {
//     "current": {
//         "total": 170,
//         "array": [
//         {
//             "timestamp": "2025-03-20T00:00:00",
//             "rush": 50,
//             "normal": 0,
//             "low": 30
//         },
//         {
//             "timestamp": "2025-03-21T00:00:00",
//             "rush": 90,
//             "normal": 60,
//             "low": 40
//         }
//         ]
//     },
//     "previous": {
//         "total": 250,
//         "array": [
//         {
//             "timestamp": "2025-03-20T00:00:00",
//             "rush": 80,
//             "normal": 50,
//             "low": 30
//         },
//         {
//             "timestamp": "2025-03-21T00:00:00",
//             "rush": 90,
//             "normal": 60,
//             "low": 40
//         }
//         ]
//     }      
// }

// export default mockDataCost;


const generateMockData = () => {
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2025, 2, 20 + i); // Tạo 7 ngày liên tiếp từ 20/03/2025
        return date.toISOString().split('T')[0];
    });

    const generateArray = () => {
        let total = 0;
        const array = dates.flatMap(date => {
            return Array.from({ length: 24 }, (_, h) => {
                const timestamp = `${date}T${String(h).padStart(2, '0')}:00:00`;
                const rush = Math.floor(Math.random() * 50) + 50;
                const normal = Math.floor(Math.random() * 50) + 30;
                const low = Math.floor(Math.random() * 50) + 10;
                total += rush + normal + low;
                
                return {
                    timestamp,
                    rush,
                    normal,
                    low
                };
            });
        });
        return { array, total };
    };

    const currentData = generateArray();
    const previousData = generateArray();

    return {
        current: {
            total: currentData.total,
            array: currentData.array
        },
        previous: {
            total: previousData.total,
            array: previousData.array
        }
    };
};

const mockDataCost = generateMockData();

export default mockDataCost;

