# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - generic [ref=e3]:
      - link "CardSavvy India" [ref=e4] [cursor=pointer]:
        - /url: /
        - img [ref=e6]
        - generic [ref=e8]: CardSavvy
        - generic [ref=e9]: India
      - navigation [ref=e10]:
        - link "Home" [ref=e11] [cursor=pointer]:
          - /url: /
        - link "Find My Card" [ref=e12] [cursor=pointer]:
          - /url: /find-my-card
      - link "Calculate Savings" [ref=e14] [cursor=pointer]:
        - /url: /find-my-card
        - img [ref=e15]
        - text: Calculate Savings
  - generic [ref=e18]:
    - img [ref=e19]
    - heading "Invalid Session" [level=2] [ref=e21]
    - paragraph [ref=e22]: Please calculate your savings first.
    - button "Go to Spend Form" [ref=e23]
```