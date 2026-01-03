# Daily Training Scoring System

## 💡 Purpose

This system rewards meaningful training, balances strength + conditioning daily, auto-regulates recovery, and prioritizes weekly/monthly consistency over daily perfection.

## 📝 Tasks & Point Assignments

Most task can only be completed **once per day**. Some tasks can be repeated multiple times in a day.

### 🟢 Mobility

| Task                            | Points |
| :------------------------------ | :----- |
| Lower body mobility (Limber 11) | 3      |
| Upper body mobility (Simple 6)  | 3      |
| Lower back stretches            | 2      |

### 🔵 Conditioning

| Task                | Points | Notes      | Session Duration |
| :------------------ | :----- | :--------- | :--------------- |
| Jumps & throws      | 3      |            |                  |
| Easy conditioning   | 5      | Repeatable | 15 minutes       |
| Medium conditioning | 7      | Repeatable | 10 minutes       |
| Hard conditioning   | 8      | Repeatable | 5 minutes        |

### 🟣 Strength

| Task        | Points |
| :---------- | :----- |
| Push        | 7      |
| Pull        | 7      |
| Legs        | 10     |
| Abs         | 5      |
| Compression | 3      |

### 🟡 Nutrition

| Task         | Points |
| :----------- | :----- |
| OMAD         | 8      |
| No carbs     | 10     |
| Protein goal | 3      |
| Fat goal     | 5      |
| Water goal   | 2      |

### ⚪ Miscellaneous

| Task                                 | Points |
| :----------------------------------- | :----- |
| Wake up early                        | 8      |
| Exercise immediately after waking up | 6      |
| Cold shower for one minute           | 3      |

### 📋 Daily Maximum Points

- Training (Mobility, Conditioning, Strength): 63
- Lifestyle (Nutrition + Miscellaneous): 45

Total points possible: 108

Extra points from repeatable tasks contribute to the daily maximum points of their respective category but cannot go beyond the maximum limit.

For example: Repeating the Easy conditioning task will NOT add more points beyond the 63 max points available for training tasks.

## 🏆 Daily Win Condition

A day counts as a win if the user meets the Minimum Effective Dose criteria.

### Minimum Effective Dose (MED)

- At least one of Upper body or Lower body mobility task completed
- At least one of Push or Pull strength task completed AND Legs strength task completed
- At least one of Easy, Medium or Hard conditioning task completed

## 📊 Daily Rating

### Training Rating

Rating is based on training points only.

Training points = Mobility + Conditioning + Strength (capped at 63)

- ❌ Missed: MED not achieved (regardless of points)
- 👍 Okay: MED achieved, 25 <= training points < 37 (40–59%), low effort day
- ✅ Solid: MED achieved, 37 <= training points < 47 (60–74%), moderate effort day
- ⭐ Great: MED achieved, 47 <= training points < 53 (75–84%), high effort day
- 🔥 Amazing: MED achieved, 53 <= training points < 60 (85–94%), very high effort day
- 🎆 Above & Beyond: MED achieved, 60 <= training points <= 63 (95–100%), exceptional effort day

### Lifestyle Rating

Rating is based on lifestyle points only.

Lifestyle points = Nutrition + Miscellaneous (capped at 45)

- ❌ Missed: lifestyle points < 12
- 👍 Okay: 12 <= lifestyle points < 22
- ✅ Solid: 22 <= lifestyle points < 32
- ⭐ Great: 32 <= lifestyle points <= 45

## 🔋 Training Readiness

Training readiness is a self-assessed measure of how prepared you feel to train on a given day.

Each day, you will record your body state as one of the following training readiness statuses.

| Status      | Description                                                           |
| ----------- | --------------------------------------------------------------------- |
| 🔴 Fatigued | You are feeling tired today and should take it slow.                  |
| 🟡 Normal   | You are feeling normally today and are ready to train.                |
| 🟢 Good     | You are feeling energetic today and are ready to go above and beyond. |

## 🎯 Training Targets

### 📅 Weekly

| Total | Rating | Meaning                      |
| ----: | ------ | ---------------------------- |
|   175 | 👍     | Minimum weekly effort        |
|   259 | ✅     | Solid weekly effort          |
|   329 | ⭐     | Great weekly effort          |
|   371 | 🔥     | Amazing weekly effort        |
|  ~420 | 🎆     | Above & beyond weekly effort |

## 🛌 Deloading

Deloads are implemented as a week of reduced work, with the goal of allowing better recovery.

### ⚙️ Adjustments

- Reduce all daily and weekly training points targets by 50%
- Modified Minimum Effective Dose (MED) for the week:
  - At least one of Upper body or Lower body mobility task completed
  - At least one of Push, Pull or Legs strength task completed
  - Easy conditioning task completed

### 🎯 Triggers

- Planned every 4th week
- 4 or more fatigued days in a week
- Average weekly training points > 350 for 3+ weeks

## 📈 Tracking & Streaks

### 🔥 Win streak

- Daily win met

### 🎖️ Consistency streak

- Weekly training points is at least **175**
- Less than **2** missed days/week
