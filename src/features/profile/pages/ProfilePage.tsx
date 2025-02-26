import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";
import {
  type ChangeEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AuthRoute } from "~/components/layout/AuthRoute";
import { PageContainer } from "~/components/layout/PageContainer";
import { SectionContainer } from "~/components/layout/SectionContainer";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Form } from "~/components/ui/form";
import { api } from "~/utils/api";
import { EditProfileFormInner } from "../components/EditProfileFormInner";
import {
  editProfileFormSchema,
  type EditProfileFormSchema,
} from "../forms/edit-profile";

const ProfilePage = () => {
  const [selectedImage, setSelectedImage] = useState<File | undefined | null>(
    null,
  );

  const apiUtils = api.useUtils();

  const form = useForm<EditProfileFormSchema>({
    resolver: zodResolver(editProfileFormSchema),
  });

  const { data: getProfileData } = api.profile.getProfile.useQuery();

  const updateProfile = api.profile.updateProfile.useMutation({
    onSuccess: async ({ bio, username }) => {
      form.reset({ bio: bio ?? "", username });
      toast.success("Berhasil updated profile");
    },
    onError: (err) => {
      console.log(err);
      if (err instanceof TRPCClientError) {
        if (err.message === "USERNAME_USED") {
          form.setError("username", {
            message: "Username sudah digunakan",
          });
        }
      }
      toast.error("Gagal update profile");
    },
  });

  const updateProflePicture = api.profile.updateProfilePicture.useMutation({
    onSuccess: () => {
      toast.success("Berhasil ganti foto profil");
      setSelectedImage(null);
      void apiUtils.profile.getProfile.invalidate();
    },
    onError: async () => {
      toast.error("Gagal ganti profil");
    },
  });

  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfileSubmit = (values: EditProfileFormSchema) => {
    const payload: {
      username?: string;
      bio?: string;
    } = {};

    if (values.username !== getProfileData?.username) {
      payload.username = values.username;
    }
    if (values.bio !== getProfileData?.bio) {
      payload.bio = values.bio;
    }

    updateProfile.mutate({
      ...payload,
    });
  };

  const handleOpenFileExplorer = () => {
    inputFileRef.current?.click();
  };

  const handleRemoveSelectImage = () => {
    setSelectedImage(null);
  };

  const handleUpdateProfilePicture = () => {
    if (selectedImage) {
      const reader = new FileReader();

      reader.onloadend = function () {
        const result = reader.result as string;
        const imageBase64 = result.substring(result.indexOf(",") + 1);

        updateProflePicture.mutate(imageBase64);
      };

      reader.readAsDataURL(selectedImage);
    }
  };

  const onPickProfilePicture: ChangeEventHandler<HTMLInputElement> = (e) => {
    if (e.target.files) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const selectedProfilePicturePreview = useMemo(() => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage);
    }
  }, [selectedImage]);

  useEffect(() => {
    if (getProfileData) {
      form.setValue("username", getProfileData.username ?? "");
      form.setValue("bio", getProfileData.bio ?? "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getProfileData]);

  return (
    <AuthRoute>
      <PageContainer>
        <SectionContainer padded minFullscreen className="gap-y-6 py-8">
          <h1 className="text-2xl font-semibold">Profile Settings</h1>
          <Card>
            <CardContent className="flex gap-6 pt-6">
              <div className="flex flex-col gap-4">
                <Avatar className="size-24">
                  <AvatarFallback>VF</AvatarFallback>
                  <AvatarImage
                    src={
                      selectedProfilePicturePreview ??
                      getProfileData?.profilePictureUrl ??
                      ""
                    }
                  />
                </Avatar>
                <Button
                  variant={"secondary"}
                  onClick={handleOpenFileExplorer}
                  size="sm"
                >
                  Ganti Foto
                </Button>
                {!!selectedImage && (
                  <>
                    <Button
                      onClick={handleRemoveSelectImage}
                      variant={"destructive"}
                      size={"sm"}
                    >
                      Hapus
                    </Button>
                    <Button onClick={handleUpdateProfilePicture} size={"sm"}>
                      Simpan
                    </Button>
                  </>
                )}

                <input
                  accept="image/*"
                  onChange={onPickProfilePicture}
                  className="hidden"
                  type="file"
                  ref={inputFileRef}
                />
              </div>

              <div className="grid flex-1 grid-cols-2">
                {getProfileData && (
                  <Form {...form}>
                    <EditProfileFormInner
                      defaultValues={{
                        bio: getProfileData?.bio,
                        username: getProfileData?.username,
                      }}
                    />
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex w-full justify-end gap-4">
            <Button
              disabled={!form.formState.isDirty}
              onClick={form.handleSubmit(handleUpdateProfileSubmit)}
            >
              Simpan
            </Button>
          </div>
        </SectionContainer>
      </PageContainer>
    </AuthRoute>
  );
};

export default ProfilePage;
