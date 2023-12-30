import {
  Button,
  EnumButtonStyle,
  EnumItemsAlign,
  FlexItem,
  Icon,
  SelectField,
  SelectFieldProps,
  ToggleField,
} from "@amplication/ui/design-system";
import { EnumModuleDtoPropertyType } from "../models";
import * as models from "../models";
import { FieldArray, FieldArrayRenderProps, getIn } from "formik";
import { useCallback, useMemo } from "react";
import { get } from "lodash";

export const typeMapping: {
  [key in models.EnumModuleDtoPropertyType]: {
    label: string;
  };
} = {
  [EnumModuleDtoPropertyType.Boolean]: {
    label: "Boolean",
  },
  [EnumModuleDtoPropertyType.DateTime]: {
    label: "DateTime",
  },
  [EnumModuleDtoPropertyType.Float]: {
    label: "Float",
  },
  [EnumModuleDtoPropertyType.Integer]: {
    label: "Integer",
  },
  [EnumModuleDtoPropertyType.Json]: {
    label: "Json",
  },
  [EnumModuleDtoPropertyType.String]: {
    label: "String",
  },
  [EnumModuleDtoPropertyType.Dto]: {
    label: "Dto",
  },
  [EnumModuleDtoPropertyType.Enum]: {
    label: "Enum",
  },
  [EnumModuleDtoPropertyType.Null]: {
    label: "Null",
  },
  [EnumModuleDtoPropertyType.Undefined]: {
    label: "Undefined",
  },
};

const options = Object.values(EnumModuleDtoPropertyType).map((value) => ({
  label: typeMapping[value].label,
  value,
}));

type Props = {
  name: string;
};

const DtoPropertyTypesField = ({ name }: Props) => {
  return (
    <FieldArray name={name} render={(props) => <PropertyTypes {...props} />} />
  );
};

type typeFieldProps = Omit<SelectFieldProps, "options">;

const PropertyTypes = ({
  form,
  name,
  remove,
  replace,
  push,
}: FieldArrayRenderProps) => {
  const propertyTypes = get(form.values, name) || [];

  const errors = useMemo(() => {
    const error = getIn(form.errors, name);
    if (typeof error === "string") return error;
    return null;
  }, [form.errors, name]);

  return (
    <div>
      {errors && <div>{errors}</div>}
      {propertyTypes?.length
        ? propertyTypes.map((type: models.PropertyTypeDef, index: number) => (
            <PropertyType
              key={index}
              index={index}
              onRemove={remove}
              name={name}
            />
          ))
        : ""}
      <Button
        onClick={() =>
          push({ type: EnumModuleDtoPropertyType.String, isArray: false })
        }
        buttonStyle={EnumButtonStyle.Text}
      >
        <Icon icon="plus" />
        Add type
      </Button>
    </div>
  );
};

type PropertyTypeProps = {
  name: string;
  index: number;
  onRemove: (index: number) => void;
};

const PropertyType = ({ name, index, onRemove }: PropertyTypeProps) => {
  const handleRemoveOption = useCallback(() => {
    onRemove(index);
  }, [onRemove, index]);

  return (
    <FlexItem itemsAlign={EnumItemsAlign.Center}>
      <SelectField
        name={`${name}.${index}.type`}
        label="Type"
        options={options}
      />
      <ToggleField name={`${name}.${index}.isArray`} label="Array" />

      <Button
        type="button"
        buttonStyle={EnumButtonStyle.Text}
        icon="trash_2"
        onClick={handleRemoveOption}
      />
    </FlexItem>
  );
};

export default DtoPropertyTypesField;
