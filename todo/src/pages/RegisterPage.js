import { useContext } from "react";
import { useForm } from "@mantine/form";
import AuthContext from "../contexts/AuthContext";



import {
  createStyles,
  Group,
  Stack,
  Button,
  TextInput,
  Title,
  PasswordInput
} from "@mantine/core";

const useStyles = createStyles((theme, _params, getRef) => {
  return {
    inputWrapper: {
      width: 250
    }
  };
});

export default function RegisterPage() {
  // We get this context to call the login function upon submission of the form
  const auth = useContext(AuthContext);
  const { classes } = useStyles();

  // New Hook for Forms, should function similar to useState Hooks
  const form = useForm({
    initialValues: {
      email: "",
      password: ""
    },
    validate: {
      // checks to see if the value is in the form of a an email
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email")
    }
  });

  function handleSubmit(values) {
    auth.register(values, form);
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {/* https://mantine.dev/core/stack/ : basically a vertical flexbox */}
      <Stack align="center" justify="center" p="xl">
        <Title /* Size of Font*/ order={1}>Register</Title>
        <TextInput
          classNames={{ wrapper: classes.inputWrapper }}
          required
          label="Email"
          placeholder="tpeorocks@roblox.com"
          {...form.getInputProps("email")}
        />
        {/* In Class TODO: Find a way to convert this to password field (ie. password hidden) using Mantine */}
        <PasswordInput
          classNames={{ wrapper: classes.inputWrapper }}
          placeholder="angularbad"
          label="Password"
          required
          {...form.getInputProps("password")}
        />
        {/* https://mantine.dev/core/group : basically a horizontal flexbox*/}
        <Group position="center">
          <Button type="submit">Register</Button>
        </Group>
      </Stack>
    </form>
  );
}
