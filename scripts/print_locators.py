import pandas as pd
path = r"c:\Users\user\OneDrive\Documents\automation_framework\data\locators.xlsx"
xl = pd.ExcelFile(path)
print("Sheets:", xl.sheet_names)
for sheet in xl.sheet_names:
    df = pd.read_excel(path, sheet_name=sheet)
    print(f"Sheet {sheet} rows:")
    print(df.head())
