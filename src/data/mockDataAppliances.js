// const mockDataCost = {
//     "current": {
//         "total": 170,
//         "labels": ["Văn phòng", "Chiếu sáng", "Điều hòa không khí", "Tải khác"],
//         "array": [
//         {
//             "timestamp": "2025-03-20T00:00:00",
//             "Văn phòng": 50,
//             "Chiếu sáng": 70,
//             "Điều hòa không khí": 30,
//             "Tải khác": 20,
//         },
//         {
//             "timestamp": "2025-03-21T00:00:00",
//             "Văn phòng": 80,
//             "Chiếu sáng": 30,
//             "Điều hòa không khí": 50,
//             "Tải khác": 10,
//         }
//         ]
//     },
//     "previous": {
//         "total": 250,
//         "labels": ["Văn phòng", "Chiếu sáng", "Điều hòa không khí", "Tải khác"],
//         "array": [
//             {
//                 "timestamp": "2025-03-20T00:00:00",
//                 "Văn phòng": 30,
//                 "Chiếu sáng": 50,
//                 "Điều hòa không khí": 90,
//                 "Tải khác": 10,
//             },
//             {
//                 "timestamp": "2025-03-21T00:00:00",
//                 "Văn phòng": 80,
//                 "Chiếu sáng": 30,
//                 "Điều hòa không khí": 50,
//                 "Tải khác": 10,
//             }
//         ]
//     }      
// }

// export default mockDataCost;

const generateMockDataAppliances = () => {
    // Tạo mảng 7 ngày liên tiếp từ 20/03/2025
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(2025, 2, 20 + i);
        return date.toISOString().split('T')[0];
    });

    // Các labels cần sử dụng
    const labels = ["Văn phòng", "Chiếu sáng", "Điều hòa không khí", "Tải khác"];

    const generateArray = () => {
        let total = 0;
        const array = dates.map(date => {
            // Tạo giá trị ngẫu nhiên cho mỗi label
            const vanPhong = Math.floor(Math.random() * 50) + 30;
            const chieuSang = Math.floor(Math.random() * 50) + 20;
            const dieuHoa = Math.floor(Math.random() * 70) + 30;
            const taiKhac = Math.floor(Math.random() * 30) + 10;
            
            // Cộng vào tổng
            total += vanPhong + chieuSang + dieuHoa + taiKhac;
            
            // Trả về object với timestamp và các giá trị
            return {
                timestamp: `${date}T00:00:00`,
                "Văn phòng": vanPhong,
                "Chiếu sáng": chieuSang,
                "Điều hòa không khí": dieuHoa,
                "Tải khác": taiKhac
            };
        });
        
        return { array, total };
    };

    // Tạo dữ liệu cho current và previous
    const currentData = generateArray();
    const previousData = generateArray();

    return {
        current: {
            total: currentData.total,
            labels: labels,
            array: currentData.array
        },
        previous: {
            total: previousData.total,
            labels: labels,
            array: previousData.array
        }
    };
};

const mockData = generateMockDataAppliances();
export default mockData;