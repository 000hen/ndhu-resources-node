import { MdGridView, MdViewAgenda } from "react-icons/md";
import JoinedButton from "./joined_button";
import ResourcePanel from "./panel";

interface GridViewPanelArgs {
    isGridView: boolean,
    setGridView: (value: boolean) => void,
    right?: JSX.Element,
    left?: JSX.Element
}

export default function GridViewPanel(configs: GridViewPanelArgs) {
    return <ResourcePanel className="sticky">
        <div className="flex justify-between">
            <div>{configs.left}</div>
            <div className="flex flex-row">
                <div className="join md:mr-2">{configs.right}</div>
                <div className="join hidden md:block">
                    <JoinedButton tips="以網格檢視" isHighlighted={configs.isGridView} onClick={() => configs.setGridView(true)}>
                        <MdGridView />
                    </JoinedButton>
                    <JoinedButton tips="以直列檢視" isHighlighted={!configs.isGridView} onClick={() => configs.setGridView(false)}>
                        <MdViewAgenda />
                    </JoinedButton>
                </div>
            </div>
        </div>
    </ResourcePanel>
}