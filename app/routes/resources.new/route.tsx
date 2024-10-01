import { ActionFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useNavigate, useSearchParams } from "@remix-run/react";
import ResourcePanel from "~/components/panel";
import { MdArrowLeft, MdArrowRight, MdCheck } from "react-icons/md";
import { DataUpload, DataUploadElementProps } from "~/types/upload";
import { useState } from "react";
import stepsElementRunners from "./steps";
import stepsRunners from "./steps.server";
import { classFormat, Premission } from "~/utils";
import { getAuthInfoWithPremission, redirectToLogin } from "~/utils.server";

export const meta: MetaFunction = () => {
    return [
        { title: "資料上傳 - 東華資源庫" },
        { name: "description", content: "你有資源嗎？一起來分享吧！" },
    ];
};

export async function loader({ request, context }: ActionFunctionArgs) {
    const auth = await getAuthInfoWithPremission({ request, context });
    if (!auth.auth)
        return redirectToLogin(request);

    if (auth.premission! < Premission.VerifiedUser)
        return redirect("/resources");

    const searchParams = new URL(request.url).searchParams;
    const step = searchParams.get("step") || "1";

    return (stepsRunners[Number(step) - 1] ?? { loader: () => redirect("/resources") }).loader();
}

export async function action(actionArgs: ActionFunctionArgs) {
    const searchParams = new URL(actionArgs.request.url).searchParams;
    const step = searchParams.get("step") || "1";

    return (stepsRunners[Number(step) - 1] ?? { action: () => null }).action(actionArgs);
}

interface CreateStepsProps extends DataUploadElementProps {
    currentStep: number,
}

function CreateSteps({ currentStep, data, setData, setIsAbleToNext }: CreateStepsProps) {
    const StepElement = stepsElementRunners[currentStep - 1];

    return <StepElement data={data} setData={setData} setIsAbleToNext={setIsAbleToNext} />;
}

function stepClass(step: number, currentStep: number) {
    return classFormat([
        "step",
        step <= currentStep && "step-primary",
    ]);
}

export default function ResourceNewIndex() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<DataUpload | null>(null);
    const [isAbleToNext, setIsAbleToNext] = useState(false);
    const step = Number(searchParams.get("step") || "1");
    const navigate = useNavigate();

    function changePage(step: number) {
        if (step > 3) {
            navigate("/resources");
            return;
        }

        setSearchParams({ step: step.toString() });
    }

    return <div>
        <ul className="steps steps-horizontal w-full mb-5">
            <li className={stepClass(1, step)}>設定資料</li>
            <li className={stepClass(2, step)}>資料上傳</li>
            <li className={stepClass(3, step)}>資料審核</li>
            <li className={stepClass(4, step)}>完成上傳</li>
        </ul>

        <CreateSteps
            currentStep={step}
            data={data}
            setData={setData}
            setIsAbleToNext={setIsAbleToNext} />

        <ResourcePanel className="mt-5">
            <div className="w-full flex justify-between">
                <div className="tooltip" data-tip={step <= 1 ? "您無法繼續上一步" : "返回修改"}>
                    <button
                        className="btn btn-error"
                        onClick={() => changePage(step - 1)}
                        disabled={step <= 1}>
                        <MdArrowLeft className="text-2xl" /> 上一步
                    </button>
                </div>
                <div className="tooltip" data-tip={!isAbleToNext ? "請先完成必要事項以繼續" : "繼續下一步驟"}>
                    <button
                        className="btn btn-primary"
                        onClick={() => changePage(step + 1)}
                        disabled={!isAbleToNext}>
                        {step >= 3
                            ? <>完成 <MdCheck /></>
                            : <>下一步 <MdArrowRight className="text-2xl" /></>}
                    </button>
                </div>
            </div>
        </ResourcePanel>
    </div>
}