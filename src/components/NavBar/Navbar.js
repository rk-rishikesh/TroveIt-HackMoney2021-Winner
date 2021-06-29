import React from "react";
import { Link, withRouter } from "react-router-dom";
import icon from './photo.png';

// Website NavBar
function Navigation(props) {
  return (
    <div className="navigation">
      <nav class="py-3 navbar navbar-expand-sm" style={{backgroundColor:"white", boxShadow:"0px 0.1px #888888" }}>
        <div class="container">
        <img src={icon} style={{height: 50, width: 150}} alt="Logo" /> 
      
          <button
            class="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarResponsive"
            aria-controls="navbarResponsive"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarResponsive">
            <ul class="navbar-nav ml-auto">
              <li
                class={`nav-item  ${
                  props.location.pathname === "/" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/">
                  Home
                  <span class="sr-only">(current)</span>
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/feeds" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/feeds" >
                  Feeds
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/marketplace" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/marketplace" >
                  Market Place
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/uploadVideo" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/uploadVideo">
                  Upload Video
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/selectVideo" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/selectVideo">
                  D-Reels
                </Link>
              </li>
              <li
                class={`nav-item  ${
                  props.location.pathname === "/myprofile" ? "active" : ""
                }`}
              >
                <Link class="nav-link" to="/myprofile">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
      </nav>
    </div>
  );
}

export default withRouter(Navigation);