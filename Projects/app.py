# =============================================================
# Palmer Penguins Explorer  -  FINISHED REFERENCE VERSION
# Run with:  streamlit run app.py
#
# Every section is labeled with the same letter as its block in
# Streamlit_Snippet_Menu.ipynb, so you can see where each piece goes.
# =============================================================

# ---------- Block A: Imports & page setup ----------
import pandas as pd
import plotly.express as px
import streamlit as st

st.set_page_config(page_title="Penguin Explorer", layout="wide")

st.title("Palmer Penguins Explorer")
st.caption("An interactive look at 344 penguins from three islands in Antarctica.")


# ---------- Block B: Load the data (cached) ----------
@st.cache_data
def load_data():
    df = pd.read_csv("data/penguins.csv")
    df = df.dropna()  # drop the 11 rows with missing measurements
    return df


df = load_data()


# ---------- Block C: Sidebar filters ----------
st.sidebar.header("Filters")

species = st.sidebar.multiselect(
    "Species",
    options=sorted(df["species"].unique()),
    default=sorted(df["species"].unique()),
)
islands = st.sidebar.multiselect(
    "Island",
    options=sorted(df["island"].unique()),
    default=sorted(df["island"].unique()),
)
mass_min, mass_max = st.sidebar.slider(
    "Body mass (g)",
    min_value=int(df["body_mass_g"].min()),
    max_value=int(df["body_mass_g"].max()),
    value=(int(df["body_mass_g"].min()), int(df["body_mass_g"].max())),
    step=50,
)

filtered = df[
    df["species"].isin(species)
    & df["island"].isin(islands)
    & df["body_mass_g"].between(mass_min, mass_max)
]

if filtered.empty:
    st.warning("No penguins match those filters. Try widening them in the sidebar.")
    st.stop()


# ---------- Block D: KPI metrics row ----------
col1, col2, col3, col4 = st.columns(4)
col1.metric("Penguins", len(filtered))
col2.metric("Avg body mass", f"{filtered['body_mass_g'].mean():,.0f} g")
col3.metric("Avg flipper", f"{filtered['flipper_length_mm'].mean():.1f} mm")
col4.metric("Species shown", filtered["species"].nunique())

st.divider()


# ---------- Block I: Tabs layout (charts live inside the tabs) ----------
tab_charts, tab_data, tab_predict = st.tabs(["Charts", "Data", "Predict"])

with tab_charts:
    # ---------- Block E: Scatter plot with pick-your-own axes ----------
    st.subheader("Compare any two measurements")
    numeric_cols = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
    c1, c2 = st.columns(2)
    x_axis = c1.selectbox("X axis", numeric_cols, index=0)
    y_axis = c2.selectbox("Y axis", numeric_cols, index=1)

    fig = px.scatter(
        filtered, x=x_axis, y=y_axis, color="species",
        hover_data=["island", "sex"],
    )
    st.plotly_chart(fig)

    left, right = st.columns(2)

    # ---------- Block F: Histogram ----------
    with left:
        st.subheader("Distribution")
        hist_col = st.selectbox("Measurement", numeric_cols, index=3, key="hist")
        fig = px.histogram(filtered, x=hist_col, color="species", barmode="overlay", nbins=30)
        st.plotly_chart(fig)

    # ---------- Block G: Bar chart of counts ----------
    with right:
        st.subheader("Penguins per island")
        counts = filtered.groupby(["island", "species"]).size().reset_index(name="count")
        fig = px.bar(counts, x="island", y="count", color="species")
        st.plotly_chart(fig)

with tab_data:
    # ---------- Block J: Data table + download button ----------
    st.subheader("The filtered data")
    st.dataframe(filtered, hide_index=True)
    st.download_button(
        "Download as CSV",
        data=filtered.to_csv(index=False),
        file_name="penguins_filtered.csv",
        mime="text/csv",
    )

with tab_predict:
    # ---------- Block K (bonus): Predict the species with machine learning ----------
    from sklearn.ensemble import RandomForestClassifier

    @st.cache_resource
    def train_model(data):
        features = ["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"]
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(data[features], data["species"])
        return model

    model = train_model(df)

    st.subheader("Which species is this penguin?")
    st.write("Move the sliders to describe a penguin and the model guesses its species.")
    p1, p2 = st.columns(2)
    bill_len = p1.slider("Bill length (mm)", 30.0, 60.0, 45.0)
    bill_dep = p1.slider("Bill depth (mm)", 13.0, 22.0, 17.0)
    flipper = p2.slider("Flipper length (mm)", 170.0, 235.0, 200.0)
    mass = p2.slider("Body mass (g)", 2700, 6300, 4200, step=50)

    new_penguin = pd.DataFrame(
        [[bill_len, bill_dep, flipper, mass]],
        columns=["bill_length_mm", "bill_depth_mm", "flipper_length_mm", "body_mass_g"],
    )
    prediction = model.predict(new_penguin)[0]
    confidence = model.predict_proba(new_penguin).max()

    st.success(f"Prediction: **{prediction}** ({confidence:.0%} confident)")


# ---------- Block L: "About this data" expander ----------
with st.expander("About this data"):
    st.markdown(
        """
        **Source:** Palmer Station Antarctica LTER, collected by Dr. Kristen Gorman
        (2007-2009). Made popular by the `palmerpenguins` R package.

        **Columns:** species, island, bill length & depth, flipper length,
        body mass, and sex. Rows with missing values were removed.

        Built by **Ryan** with Python, pandas, Plotly, and Streamlit.
        """
    )
