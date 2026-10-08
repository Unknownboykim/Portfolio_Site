# Palmer Penguins Explorer

An interactive web app for exploring 333 penguins from three islands in Antarctica, with a machine-learning model that predicts a penguin's species from its measurements.

**Live app:** _(paste your share.streamlit.io link here)_

_(add a screenshot here: `![screenshot](screenshot.png)`)_

## Features

- Sidebar filters by species, island, and body mass that update the whole page
- Headline metrics that recalculate as you filter
- Interactive Plotly charts _(list the ones you chose)_
- A Random Forest classifier that guesses the species from slider inputs
- Download the filtered data as a CSV

## Built with

Python · pandas · Plotly · scikit-learn · Streamlit

## What I learned

- _(e.g. how Streamlit re-runs the script on every interaction, and why caching matters)_
- _(e.g. filtering a DataFrame with multiple conditions)_
- _(something you found interesting in the data)_

## Run it locally

```bash
pip install -r requirements.txt
streamlit run starter_app.py
```

## Data

Palmer Station Antarctica LTER, collected by Dr. Kristen Gorman (2007-2009). Made available through the `palmerpenguins` package (CC0).
