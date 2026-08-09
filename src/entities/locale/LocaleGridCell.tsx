import { LocaleData } from '@entities/locale/LocaleTypes';
import HoverableObjectName from "@features/layers/hovercard/HoverableObjectName";
import React from "react";

type Props = {
    locale: LocaleData
}

const LocaleGridCell: React.FC<Props> = ({ locale }) => {
    return (
        <div className="LocaleGridCell">
            {/* to match the design doc */}
            <code>{locale.codeDisplay}</code>{' '}
            <HoverableObjectName object={locale} labelSource="territory" />
        </div>
    )
}

export default LocaleGridCell;
