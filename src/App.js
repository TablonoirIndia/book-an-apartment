import "./App.css";
import "bootstrap-4-react";
import "react-bootstrap";
import "react-icons/fa";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { Provider } from "react-redux";
import store from "./redux/store";
import { ToastProvider } from "./context/ToastContext";

import { AuthProvider } from "./components/AuthContext";

import ProjectsLayout from "./components/ProjectsLayout";
import GoogleMapWithMarkers from "./components/GoogleMapWithMarkers";

import MasterPlanLayout from "./components/MasterPlanLayout";
import BlockLayout from "./components/BlockLayout";
import PlotBookLayout from "./components/PlotBookLayout";
import BookingProcessLayout from "./components/BookingProcessLayout";
import PaymentLayout from "./components/PaymentLayout";
import InstantBooking from "./components/InstantBooking";
import SectionLayout from "./components/SectionLayout";
import SelectedPlotLayout from "./components/SelectedPlotLayout";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import Floorplan3D from "./components/Floorplan3D";

import BuildingViewer from "./components/building-viewer";

import BuildingViewePage from "./components/building-view-component/BuildingPage";

import ApartmentViewer from "./components/ApartmentViewer";
import FloorPlanPage from "./components/FloorPlanPage";
import PanoramaViewer from "./components/PanoramaViewer";

import UnitPage from "./components/UnitPage";
import RoomPanoramaPage from "./components/RoomPanoramaPage";
import GalleryPanoramaPage from "./components/GalleryPanoramaPage";
import PaymentPage from "./components/PaymentPage";
import UserDashboard from "./components/UserDashboard";
import ChatBubble from "./components/ChatBubble";

const MAPS_LIBRARIES = ["places"];

function App() {
  return (
    <LoadScript
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
      libraries={MAPS_LIBRARIES}
    >
      {/* <Router> */}
      <BrowserRouter basename="/book-an-apartment">
        <Provider store={store}>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<ProjectsLayout />} />
              <Route
                path="/location/:projectId"
                element={<GoogleMapWithMarkers />}
              />
              <Route
                path="/masterplan/:projectId/"
                element={<MasterPlanLayout />}
              />
              <Route
                path="/block/:projectId/:masterPlanId/:blockId"
                element={<BlockLayout />}
              />
              <Route
                path="/booking/:projectId/:plotId/:userId"
                element={<PlotBookLayout />}
              />
              <Route
                path="/bookingprocess/:projectId/:plotId/:userId"
                element={<BookingProcessLayout />}
              />
              <Route
                path="/payment/:projectId/:plotId/:userId"
                element={<PaymentLayout />}
              />

              <Route path="/payment-success" element={<PaymentSuccessPage />} />

              <Route
                path="/selected-plot/:projectId/:blockId/:sectionId/:plotId"
                element={<SelectedPlotLayout />}
              />
              <Route
                path="/section/:projectId/:blockId/:sectionId"
                element={<SectionLayout />}
              />
              <Route path="/instant-booking" element={<InstantBooking />} />

              <Route path="/floorplan" element={<Floorplan3D />} />
              <Route path="/building-viewer" element={<BuildingViewer />} />

              <Route path="/building-view" element={<BuildingViewePage />} />

              <Route
                path="/apartment-view/:masterPlanId"
                element={<ApartmentViewer />}
              />
              <Route path="/floor/:floorId" element={<FloorPlanPage />} />
              <Route path="/unit/:plotId" element={<UnitPage />} />
              <Route
                path="/unit/:plotId/room/:roomId"
                element={<RoomPanoramaPage />}
              />
              <Route
                path="/floor/:floorId/room/:roomId"
                element={<PanoramaViewer />}
              />
              <Route
                path="/unit/:plotId/gallery/:index"
                element={<GalleryPanoramaPage />}
              />
              <Route path="/payment/:bookingId" element={<PaymentPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
            <ChatBubble />
          </ToastProvider>
        </Provider>
      {/* </Router> */}
      </BrowserRouter>
    </LoadScript>
  );
}

export default App;
