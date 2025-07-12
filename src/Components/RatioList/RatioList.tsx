import { TestDataCompany } from "../Table/TestData";

type Props = {
  config: any;
  data: any;
};
//const data = TestDataCompany[0];
//type Company = typeof data;

//从 data 这个数组里，拿出第一个元素的类型，定义成 Company 类型

/*
const config = [
    {
      Label: "Date",
      render:(company: Company) => company.companyName,
      subTitle: "This is the Company name",
    }
];
*/

const RatioList = ({config, data}: Props) => {
    const renderedRow = config.map((row:any) => {
     console.log("渲染 row:", row.Label, row.render ? row.render(data) : "无 render");
      return (
        <li key={row.Label}  className = "py-6 sm:py-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {row.Label}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {row.subTitle && row.subTitle}
              </p>
          </div>

          <div className="inline-flex items-center text-base font-semiblod text-gray-900">      
            {typeof row.render === "function" && data ? row.render(data) : null}
          </div>
        </div>
        </li>
      )
    });

  return (
    <div className = "bg-white shadow rounded-lg mb-4 p-4 sm:p-6 h-full  text-gray-900">
        <ul className="divide-y divided-gray-200">{renderedRow}</ul>
    </div>
  );
}

export default RatioList;