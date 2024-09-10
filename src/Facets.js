"use strict";

import React from "react";

import { GeneSearchBox } from "./GeneSearchBox";
import { ChromosomeInfo } from "higlass/dist/hglib";
import Select from "react-select";
import axios from "axios";

const FILES_LIST_PATH =
  "https://aveit.s3.amazonaws.com/misc/specificancer/files.json";

const DEFAULT_DATASETS = [{ value: "Loading...", label: "Loading..." }];

const spacerTrack = () => {
  return {
    uid: window.crypto.randomUUID(),
    type: "text",
    options: {
      backgroundColor: "#ffffff",
      textColor: "#333333",
      fontSize: 14,
      fontFamily: "Arial",
      fontWeight: "normal",
      offsetY: 0, // offset from the top of the track
      align: "left", // left, middle, right
      text: "",
    },
    width: 568,
    height: 10,
  };
};

const getBigwigTrack = (label, url) => {
  return {
    data: {
      type: "bbi",
      url: url,
      chromSizesUrl:
        "https://aveit.s3.amazonaws.com/higlass/data/sequence/hg38.chrom.sizes",
    },
    uid: window.crypto.randomUUID(),
    type: "bar",
    options: {
      labelPosition: "bottomLeft",
      labelLeftMargin: 0,
      labelRightMargin: 0,
      labelTopMargin: 0,
      labelColor: "black",
      labelBottomMargin: 0,
      labelShowResolution: false,
      labelShowAssembly: true,
      axisPositionHorizontal: "right",
      axisLabelFormatting: "scientific",
      barFillColor: "darkgreen",
      valueScaling: "linear",
      trackBorderWidth: 0,
      trackBorderColor: "black",
      labelTextOpacity: 1.0,
      name: label,
    },
    width: 20,
    height: 50,
  };
};

export class Facets extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      region: "",
      regionError: false,
      datasets: DEFAULT_DATASETS,
      selectedDatasets: [],
    };
  }

  loadFiles = () => {
    axios.get(FILES_LIST_PATH).then((response) => {
      const files = response.data.map((f) => {
        return { value: f.s3_url, label: f.label };
      });
      this.setState({
        datasets: files,
      });
    });
  };

  componentDidMount() {
    this.loadFiles();
  }

  exportDisplay = () => {
    const hgc = window.hgc.current;
    if (!hgc) {
      console.warn("Higlass component not found.");
      return;
    }
    window.Buffer = window.Buffer || require("buffer").Buffer;
    const svg = hgc.api.exportAsSvg();

    var element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg)
    );
    element.setAttribute("download", "cohort.svg");
    element.click();
  };

  addToRegion = (evt) => {
    this.setState({
      region: evt.target.value,
    });
  };

  goToRegion = () => {
    const hgc = window.hgc.current;
    if (!hgc) {
      console.warn("Higlass component not found.");
      return;
    }

    const regexp =
      /(chr)([0-9]{1,2}|X|Y|MT)(:)(\d+)(-)(chr)([0-9]{1,2}|X|Y|MT)(:)(\d+)$/g;

    const isValidRegion = regexp.test(this.state.region);

    if (!isValidRegion) {
      this.setState({
        regionError: true,
      });
      return;
    }

    this.setState({
      regionError: false,
    });

    const locations = this.state.region.split("-");
    const location1 = locations[0];
    const location1_ = location1.split(":");
    const location2 = locations[1];
    const location2_ = location2.split(":");

    const chr_first = location1_[0];
    const pos_first = parseInt(location1_[1], 10);
    const chr_sec = location2_[0];
    const pos_sec = parseInt(location2_[1], 10);

    const viewconf = hgc.api.getViewConfig();

    ChromosomeInfo("//s3.amazonaws.com/pkerp/data/hg19/chromSizes.tsv")
      // Now we can use the chromInfo object to convert
      .then((chromInfo) => {
        hgc.api.zoomTo(
          viewconf.views[0].uid,
          chromInfo.chrToAbs([chr_first, pos_first]),
          chromInfo.chrToAbs([chr_sec, pos_sec]),
          chromInfo.chrToAbs(["chr1", 0]),
          chromInfo.chrToAbs(["chr1", 1000]),
          2500 // Animation time
        );
      });
  };

  handleDatasetChange = (selectedDatasets) => {
    this.setState({ selectedDatasets }, () => {
      if (!window.hgc) {
        return;
      }
      const hgc = window.hgc.current;
      const viewconf = hgc.api.getViewConfig();
      // Delete all added tracks
      viewconf.views[0].tracks.top = viewconf.views[0].tracks.top.slice(0, 2);
      selectedDatasets.forEach((file) => {
        const track = getBigwigTrack(file.label, file.value);
        viewconf.views[0].tracks.top.push(track);
        viewconf.views[0].tracks.top.push(spacerTrack());
      });
      hgc.api.setViewConfig(viewconf, true).then((v) => {
        const settings = {
          viewId: "aa",
          trackId: viewconf.views[0].tracks.top[0].uid,
        };
        // This will resize the parent window to accommodate all new tracks
        hgc.trackDimensionsModifiedHandlerBound(settings);
      });
    });
  };

  render() {
    const { selectedDatasets, datasets } = this.state;

    const regionClass = this.state.regionError
      ? "form-control is-invalid form-control-sm mb-2 mr-sm-2"
      : "form-control form-control-sm mb-2 mr-sm-2";

    return (
      <React.Fragment>
        <div className="row z0">
          <div className="col">
            <div className="d-block bg-light px-2 mb-2">
              <small>DATASETS</small>
            </div>

            <div className="mb-1 mt-3">Add datasets</div>

            <Select
              value={selectedDatasets}
              onChange={this.handleDatasetChange}
              options={datasets}
              closeMenuOnSelect={false}
              isMulti
              placeholder="Select multiple..."
            />

            <div className="d-block bg-light px-2 mb-2 mt-3">
              <small>NAVIGATION</small>
            </div>

            <div className="mb-1 mt-3">Go to specific region</div>
            <input
              type="text"
              onChange={this.addToRegion}
              className={regionClass}
              placeholder="e.g., chr2:1000-chr2:2000"
            />
            <button
              className="btn btn-outline-primary btn-sm btn-block mb-3"
              onClick={this.goToRegion}
            >
              Go
            </button>

            <div className="mb-1 mt-2">Go to specific gene</div>
            <GeneSearchBox />

            <div className="d-block mb-1 mt-4">
              <button
                type="button"
                className="btn btn-primary btn-sm btn-block"
                onClick={this.exportDisplay}
              >
                <i className="icon icon-download icon-sm fas mr-1"></i>
                Export display
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
