import React, { useState,useEffect } from "react";
import { MenuItem, FormControl, Select, Card, CardContent } from "@material-ui/core";
import InfoBox from './InfoBox/InfoBox';
import Map from './Map/Map';
import Table from './Table/Table'
import LineGraph from './LineGraph/LineGraph';
import { sortData } from './util';
import './App.css';
import 'leaflet/dist/leaflet.css';

const App = () => {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then(response => response.json())
      .then(data => {
        setCountryInfo(data);
      })
  }, [])

  useEffect(() => {

    const getContriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then(response => response.json())
        .then((data) => {
          const countries = data.map((country) => (
            {
              name: country.country,
              value: country.countryInfo.iso2
            }
          ));
          
          const sortedData = sortData(data);
          setTableData(sortedData);
          setCountries(countries);
        })
    };

    getContriesData();
  }, []);  

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;

    const url = 
        countryCode === 'worldwide' ? 
          'https://disease.sh/v3/covid-19/all' :
          `https://disease.sh/v3/covid-19/countries/${countryCode}`;
  
    await fetch(url)
        .then(response => response.json())
        .then(data => {
          setCountry(countryCode);
          setCountryInfo(data);
          setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          setMapZoom(10);
             
      })     
  };

  useEffect(() => {
    console.log("Map center Updated ", mapCenter);
  },[mapCenter]);
  
  return (
    <div className="app">
      <div className = "app__left">
        <div className = "app__header">
          <h1>Covid-19 Tracker</h1>
          
          <FormControl className = "app__dropdown">
            <Select variant = "outlined"
              onChange = {onCountryChange}
              value = {country}>
                <MenuItem value = "worldwide">Worldwide</MenuItem>
                {
                  countries.map(country => (
                    <MenuItem value = {country.value}>{country.name}</MenuItem>
                  ))
                }
              </Select>
          </FormControl>
        </div>

        <div className = "app__stats">
          <InfoBox title = "Coronavirus Cases" cases = {countryInfo.todayCases} total = {countryInfo.cases}/>

          <InfoBox title = "Recovered" cases = {countryInfo.todayRecovered} total = {countryInfo.recovered}/>

          <InfoBox title = "Deaths" cases = {countryInfo.todayDeaths} total = {countryInfo.deaths} />
        </div>

        <Map 
          center = {mapCenter}
          zoom = {mapZoom}
        />
      </div>
      
      <Card className = "app__right">
        <CardContent>
          <h3>Lives Cases by Country</h3>
          <Table countries = {tableData}/>
          <h3>Worldwide New Cases</h3>
          <LineGraph />
        </CardContent>
      </Card>
      
      

    </div>
  );
}

export default App;
