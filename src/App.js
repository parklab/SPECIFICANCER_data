import React from "react";
import "./App.css";
import { Facets } from "./Facets";
import "bootstrap/dist/css/bootstrap.min.css";
import { HiglassBrowser } from "./HiglassBrowser";

function App() {
  return (
    <div className="App">
      
      <div className="container mt-5">
        <h2 id="variant-view" className="text-center">
          SPECIFICANCER data visualization
        </h2>

        {/* <div className="h3 mt-5" id="sec:visualization">
          Interactive visualization
        </div> */}
        <div className="row mt-4">
          <div className="col-md-3 ">
            <div className="border p-2 mt-3">
              <Facets />
            </div>
          </div>
          <div className="col-md-9">
            <div className="fixedHeight">
              <HiglassBrowser />
            </div>
          </div>
        </div>
        <div className="py-5"></div>
      </div>
      <div className="container-fluid bg-light mt-5 py-4 text-center">
        <div className="mb-1">
          For support or questions, please open an issue on our{" "}
          <a href="https://github.com/parklab/SPECIFICANCER_data">GitHub repository</a>.
        </div>
      </div>
    </div>
  );
}

export default App;
