// 历年真题数据索引

// 选择题数据
import { exam2024 } from './exam2024';
import { exam2023 } from './exam2023';
import { exam2022 } from './exam2022';
import { exam2021 } from './exam2021';
import { exam2020 } from './exam2020';
import { exam2019 } from './exam2019';

// 大题数据
import { essay2024 } from './essay2024';
import { essay2023 } from './essay2023';
import { essay2022 } from './essay2022';
import { essay2021 } from './essay2021';
import { essay2020 } from './essay2020';
import { essay2019 } from './essay2019';

// 选择题按年份
export const examDataByYear = {
  2024: exam2024,
  2023: exam2023,
  2022: exam2022,
  2021: exam2021,
  2020: exam2020,
  2019: exam2019,
};

// 大题按年份
export const essayDataByYear = {
  2024: essay2024,
  2023: essay2023,
  2022: essay2022,
  2021: essay2021,
  2020: essay2020,
  2019: essay2019,
};

export default examDataByYear;
