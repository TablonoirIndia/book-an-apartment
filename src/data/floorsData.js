const floorsData = {
  1: {
    id: 1,
    name: "Floor 1",
    floorplan: require('../asserts/img/floorplan-1.png'),
    rooms: [
      { id: 101, name: "Unit 101", yaw: "-30deg", pitch: "0deg", panorama: require('../asserts/img/rooms/unit-101.png') },
    ],
  },
  2: {
    id: 2,
    name: "Floor 2",
    floorplan: require('../asserts/img/floorplan-2.png'),
    rooms: [
      { id: 201, name: "Unit 201", yaw: "-40deg", pitch: "0deg", panorama: require('../asserts/img/rooms/unit-201.png') },
      { id: 202, name: "Unit 202", yaw: "0deg",   pitch: "0deg", panorama: require('../asserts/img/rooms/unit-202.png') },
      { id: 203, name: "Unit 203", yaw: "40deg",  pitch: "0deg", panorama: require('../asserts/img/rooms/unit-203.png') },
    ],
  },
  3: {
    id: 3,
    name: "Floor 3",
    floorplan: require('../asserts/img/floorplan-3.png'),
    rooms: [
      { id: 301, name: "Unit 301", yaw: "0deg", pitch: "0deg", panorama: require('../asserts/img/rooms/unit-301.png') },
    ],
  },
};

export default floorsData;